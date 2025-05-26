import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Contributors.module.css';

const COLORS = ['#0366d6', '#6f42c1', '#28a745', '#d73a49', '#ffd33d', '#a2eeef', '#f66a0a', '#e99695'];
const PAGE_SIZE = 10;

const Contributors = ({ contributors }) => {
  const [page, setPage] = useState(0);
  if (!contributors || contributors.length === 0) {
    return (
      <div className={styles.section}>
        <h2>Contributor Activity</h2>
        <div className={styles.placeholder}>[Contributor activity will appear here]</div>
      </div>
    );
  }
  // Sort contributors by contributions descending
  const sortedContributors = [...contributors].sort((a, b) => (b.contributions || 0) - (a.contributions || 0));
  const totalCommits = sortedContributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
  // Bar chart: top 10 contributors
  const topContributors = sortedContributors.slice(0, 10);
  // Pagination for full list
  const pageCount = Math.ceil(sortedContributors.length / PAGE_SIZE);
  const paginatedContributors = sortedContributors.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handlePage = (delta) => {
    setPage((p) => Math.max(0, Math.min(pageCount - 1, p + delta)));
  };

  return (
    <div className={styles.section}>
      <h2>Contributor Activity</h2>
      <div className={styles.summary}>
        <span>Total Contributors: <b>{contributors.length}</b></span>
        <span>Total Commits: <b>{totalCommits}</b></span>
      </div>
      <div className={styles.barChartWrap}>
        <div className={styles.barChartTitle}>Top 10 Contributors</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topContributors} layout="vertical" margin={{ left: 24, right: 24, top: 8, bottom: 24 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={120} interval={0} />
            <Tooltip formatter={(v) => [`${v} commits`, 'Commits']} />
            <Bar dataKey="contributions" fill="#0366d6">
              {topContributors.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.contributorList}>
        {paginatedContributors.map((c, i) => (
          <div
            className={styles.contributor}
            key={i}
            onClick={() => window.open(`https://github.com/${c.name}`, '_blank', 'noopener noreferrer')}
            style={{ cursor: 'pointer' }}
            title={`View ${c.name}'s GitHub profile`}
          >
            <img src={c.avatar_url} alt={c.name} className={styles.avatar} />
            <span className={styles.name}>{c.name}</span>
            <span className={styles.count}>{c.contributions} commits</span>
          </div>
        ))}
      </div>
      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 0} onClick={() => handlePage(-1)}>&lt; Prev</button>
          <span>Page {page + 1} of {pageCount}</span>
          <button disabled={page === pageCount - 1} onClick={() => handlePage(1)}>Next &gt;</button>
        </div>
      )}
    </div>
  );
};

export default Contributors;
