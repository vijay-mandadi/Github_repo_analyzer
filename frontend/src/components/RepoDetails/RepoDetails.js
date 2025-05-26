import React from 'react';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import styles from './RepoDetails.module.css';

const RepoDetails = ({ details }) => (
  <div className={styles.section}>
    <h2>Repository Details</h2>
    <div className={styles.placeholder}>
      {details ? (
        <>
          <div className={styles.detailRow}>
            <FaGithub className={styles.icon} />
            <span className={styles.label}>Name:</span>
            <span className={styles.value}>{details.name}</span>
          </div>
          <div className={styles.detailRow}>
            <FaStar className={styles.icon} />
            <span className={styles.label}>Stars:</span>
            <span className={styles.value}>{details.stars}</span>
          </div>
          <div className={styles.detailRow}>
            <FaCodeBranch className={styles.icon} />
            <span className={styles.label}>Forks:</span>
            <span className={styles.value}>{details.forks}</span>
          </div>
        </>
      ) : (
        '[Repository details will appear here]'
      )}
    </div>
  </div>
);

export default RepoDetails;
