import os
import re
from typing import Dict, Any
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API = "https://api.github.com"

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def parse_github_url(url: str):
    match = re.match(r"https?://github.com/([^/]+)/([^/]+)(/.*)?$", url)
    if match:
        return match.group(1), match.group(2)
    return None, None

async def fetch_github_api(client: httpx.AsyncClient, endpoint: str) -> Dict[str, Any]:
    url = f"{GITHUB_API}{endpoint}"
    resp = await client.get(url)
    return resp

@app.get("/")
def read_root():
    return JSONResponse(content={"message": "GitHub Analyzer Ready"})

@app.post("/analyze")
async def analyze_repo(payload: dict, request: Request):
    repo_url = payload.get("repo_url", "")
    owner, repo = parse_github_url(repo_url)
    if not owner or not repo:
        return JSONResponse(status_code=400, content={"error": "Invalid GitHub repository URL."})

    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
        "X-GitHub-Api-Version": "2022-11-28"
    }
    headers = {k: v for k, v in headers.items() if v}

    async with httpx.AsyncClient(headers=headers, timeout=10) as client:
        try:
            repo_resp = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}")
            if repo_resp.status_code == 404:
                return JSONResponse(status_code=404, content={"error": "Repository not found."})
            if repo_resp.status_code == 403 and repo_resp.headers.get("X-RateLimit-Remaining") == "0":
                reset = repo_resp.headers.get("X-RateLimit-Reset")
                return JSONResponse(status_code=429, content={"error": "GitHub API rate limit exceeded.", "reset": reset})
            repo_data = repo_resp.json()

            # Fetch all contributors (up to 1000 for performance)
            all_contributors = []
            per_page_c = 100
            page_c = 1
            while len(all_contributors) < 1000:
                contrib_url = f"{GITHUB_API}/repos/{owner}/{repo}/contributors?per_page={per_page_c}&page={page_c}"
                resp_c = await client.get(contrib_url)
                if resp_c.status_code != 200:
                    break
                page_contribs = resp_c.json()
                if not page_contribs:
                    break
                all_contributors.extend(page_contribs)
                if len(page_contribs) < per_page_c:
                    break
                page_c += 1
            contrib_data = all_contributors

            # Fetch all commits from the last year (up to 1000, paginated)
            from datetime import datetime, timedelta
            all_commits = []
            per_page = 100
            page = 1
            now = datetime.utcnow()
            since = (now - timedelta(days=365)).isoformat() + 'Z'
            while len(all_commits) < 1000:
                commits_url = f"{GITHUB_API}/repos/{owner}/{repo}/commits?per_page={per_page}&page={page}&since={since}"
                resp = await client.get(commits_url)
                if resp.status_code != 200:
                    break
                page_commits = resp.json()
                if not page_commits:
                    break
                all_commits.extend(page_commits)
                if len(page_commits) < per_page:
                    break
                page += 1
            commits_data = all_commits

            # Prepare response
            repo_details = {
                "name": repo_data.get("full_name"),
                "description": repo_data.get("description"),
                "stars": repo_data.get("stargazers_count"),
                "forks": repo_data.get("forks_count"),
                "watchers": repo_data.get("watchers_count"),
                "url": repo_data.get("html_url"),
                "owner": repo_data.get("owner", {}).get("login"),
                "avatar_url": repo_data.get("owner", {}).get("avatar_url"),
            }
            contributors = [
                {
                    "name": c.get("login"),
                    "avatar_url": c.get("avatar_url"),
                    "contributions": c.get("contributions")
                }
                for c in contrib_data
            ]
            commits = [
                {
                    "message": cm.get("commit", {}).get("message"),
                    "author": cm.get("commit", {}).get("author", {}).get("name"),
                    "date": cm.get("commit", {}).get("author", {}).get("date"),
                    "sha": cm.get("sha"),
                    "url": cm.get("html_url"),
                }
                for cm in commits_data
            ]

            # --- Commit Frequency (per day for last 365 days and last 30 days) ---
            from collections import Counter
            from datetime import datetime, timedelta
            commit_dates = [
                cm.get("commit", {}).get("author", {}).get("date")[:10]
                for cm in commits_data if cm.get("commit", {}).get("author", {}).get("date")
            ]
            now = datetime.utcnow().date()
            last_30_days = [(now - timedelta(days=i)).isoformat() for i in range(29, -1, -1)]
            last_365_days = [(now - timedelta(days=i)).isoformat() for i in range(364, -1, -1)]
            freq_counter = Counter(commit_dates)
            commit_frequency_month = [{"date": d, "count": freq_counter.get(d, 0)} for d in last_30_days]
            commit_frequency_year = [{"date": d, "count": freq_counter.get(d, 0)} for d in last_365_days]

            # --- Language Distribution ---
            lang_resp = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/languages")
            lang_data = lang_resp.json() if lang_resp.status_code == 200 else {}
            lang_total = sum(lang_data.values()) or 1
            language_distribution = [
                {"language": k, "percent": round(100*v/lang_total, 2)} for k, v in lang_data.items()
            ]

            # --- Open/Closed Issues Snapshot ---
            issues_resp = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/issues?state=all&per_page=100")
            issues_data = issues_resp.json() if issues_resp.status_code == 200 else []
            open_issues = [i for i in issues_data if i.get("state") == "open" and "pull_request" not in i]
            closed_issues = [i for i in issues_data if i.get("state") == "closed" and "pull_request" not in i]
            avg_close_time = None
            if closed_issues:
                close_times = []
                for i in closed_issues:
                    created = i.get("created_at")
                    closed = i.get("closed_at")
                    if created and closed:
                        t1 = datetime.fromisoformat(created.replace('Z', '+00:00'))
                        t2 = datetime.fromisoformat(closed.replace('Z', '+00:00'))
                        close_times.append((t2-t1).total_seconds())
                if close_times:
                    avg_close_time = round(sum(close_times) / len(close_times) / 3600, 2)  # hours

            issues_snapshot = {
                "open": len(open_issues),
                "closed": len(closed_issues),
                "avg_close_time_hours": avg_close_time
            }

            return JSONResponse(content={
                "repoDetails": repo_details,
                "contributors": contributors,
                "commits": commits,
                "commitFrequencyMonth": commit_frequency_month,
                "commitFrequencyYear": commit_frequency_year,
                "languageDistribution": language_distribution,
                "issuesSnapshot": issues_snapshot
            })
        except httpx.RequestError:
            return JSONResponse(status_code=503, content={"error": "Network error while contacting GitHub API."})
        except Exception as ex:
            return JSONResponse(status_code=500, content={"error": f"Unexpected error: {str(ex)}"})
