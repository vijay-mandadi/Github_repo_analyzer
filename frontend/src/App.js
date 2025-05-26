import React, { useState } from 'react';
import InputForm from './components/InputForm/InputForm';
import ResultsSection from './components/ResultsSection/ResultsSection';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import Loader from './components/Loader/Loader';
import HistorySidebar from './components/History/HistorySidebar';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('github_repo_analyzer_history');
    return stored ? JSON.parse(stored) : [];
  });

  // Dummy parsed data for modular ResultsSection (replace with real data parsing later)
  const repoDetails = response && response.repoDetails;
  const contributors = response && response.contributors;
  const commits = response && response.commits;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'An error occurred');
        setResponse(null);
      } else {
        // Save to history in localStorage and update state BEFORE setResponse
        const HISTORY_KEY = 'github_repo_analyzer_history';
        let newHistory = history.filter(item => item.repoUrl !== repoUrl);
        newHistory.unshift({ name: data.repoDetails?.name || repoUrl, repoUrl, timestamp: Date.now(), response: data });
        if (newHistory.length > 10) newHistory = newHistory.slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        setHistory(newHistory);
        setResponse(data);
      }
    } catch (err) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryRepo = (selectedRepoUrl) => {
    setRepoUrl(selectedRepoUrl);
    const found = history.find(item => item.repoUrl === selectedRepoUrl);
    if (found && found.response) {
      setResponse(found.response);
      setError(null);
    } else {
      // Optionally auto-analyze if not cached:
      // handleAnalyze({ preventDefault: () => {} });
    }
  };


  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className={`app-root${sidebarOpen ? ' sidebar-open' : ''}`}>
      <HistorySidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onSelectRepo={handleSelectHistoryRepo} history={history} />
      <div className={`analyzer-container${sidebarOpen ? ' shifted' : ''}`}>
        <h1 className="analyzer-title">GitHub Repository Analyzer</h1>
        <InputForm repoUrl={repoUrl} setRepoUrl={setRepoUrl} onAnalyze={handleAnalyze} loading={loading} />
        {loading && <Loader />}
        <ErrorMessage message={error} />
        {response && (
          <ResultsSection
            repoDetails={repoDetails}
            contributors={contributors}
            commits={commits}
            commitFrequencyMonth={response.commitFrequencyMonth}
            commitFrequencyYear={response.commitFrequencyYear}
            languageDistribution={response.languageDistribution}
            issuesSnapshot={response.issuesSnapshot}
          />
        )}
      </div>
    </div>
  );
}

export default App;
