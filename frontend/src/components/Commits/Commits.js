import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './Commits.module.css';

const Commits = ({ commits, commitFrequencyMonth, commitFrequencyYear }) => {
  const [view, setView] = useState(commitFrequencyYear && commitFrequencyYear.length > 0 ? 'year' : 'month');
  const totalCommits = Array.isArray(commits) ? commits.length : 0;
  const freqData = view === 'year' ? commitFrequencyYear : commitFrequencyMonth;

  // Date range for filtering commit list
  let minDate = null;
  if (freqData && freqData.length > 0) {
    minDate = freqData[0].date;
  }
  // Only show commits within the selected date range
  const filteredCommits = commits && minDate
    ? commits.filter(c => c.date && c.date.slice(0, 10) >= minDate)
    : commits;

  return (
    <div className={styles.section}>
      <h2>Commit Activity</h2>
      <div className={styles.summary}>
        <span>Total Commits: <b>{totalCommits}</b></span>
        <span style={{marginLeft: 'auto'}}>
          <button className={view === 'month' ? styles.activeBtn : ''} onClick={() => setView('month')}>Last 30 Days</button>
          <button className={view === 'year' ? styles.activeBtn : ''} onClick={() => setView('year')}>Last 12 Months</button>
        </span>
      </div>
      <div className={styles.chartWrap}>
        {freqData && freqData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={freqData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={24} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip formatter={(v) => [`${v} commits`, 'Commits']} />
              <Line type="monotone" dataKey="count" stroke="#0366d6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.placeholder}>[Commit frequency chart will appear here]</div>
        )}
      </div>
      <div className={styles.commitListScrollable}>
        {filteredCommits && filteredCommits.length > 0 ? (
          filteredCommits.map((c, i) => (
            <div className={styles.commit} key={i}>
              <span className={styles.message}>{c.message}</span>
              <span className={styles.date}>{c.date && new Date(c.date).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className={styles.placeholder}>[Commit activity will appear here]</div>
        )}
      </div>
    </div>
  );
};

export default Commits;
