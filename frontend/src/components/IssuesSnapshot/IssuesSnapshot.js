import React from 'react';
import styles from './IssuesSnapshot.module.css';

function formatAvgCloseTime(hours) {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  const h = Math.floor(hours);
  const mins = Math.round((hours - h) * 60);
  if (mins === 0) return `${h} hr`;
  return `${h} hr ${mins} min`;
}

const IssuesSnapshot = ({ data }) => {
  if (!data) return null;
  return (
    <div className={styles.section}>
      <h2>Issues Snapshot</h2>
      <div className={styles.issuesStats}>
        <div className={styles.issuesStatBox}>
          <div className={styles.issuesStatLabel}>Open Issues</div>
          <div className={`${styles.issuesStatValue} ${styles.openValue}`}>{data.open}</div>
        </div>
        <div className={styles.issuesStatBox}>
          <div className={styles.issuesStatLabel}>Closed Issues</div>
          <div className={`${styles.issuesStatValue} ${styles.closedValue}`}>{data.closed}</div>
        </div>
      </div>
      <div className={styles.avgTimeRow}>
        <div className={styles.issuesStatBox}>
          <div className={styles.issuesStatLabel}>Avg Close Time</div>
          <div className={`${styles.issuesStatValue} ${styles.avgTimeValue}`}>{
            data.avg_close_time_hours !== null
              ? formatAvgCloseTime(data.avg_close_time_hours)
              : 'N/A'
          }</div>
        </div>
      </div>
    </div>
  );
};

export default IssuesSnapshot;
