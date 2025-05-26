# Backend Dockerfile for FastAPI
FROM python:3.11-slim

WORKDIR /app

COPY . /app

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn[standard] requests pydantic python-dotenv httpx

# Optional: install requirements.txt if present
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
