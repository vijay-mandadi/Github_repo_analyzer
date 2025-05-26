import React from 'react';
import styles from './HistorySidebar.module.css';
import { FaHistory, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleString();
}

const HistorySidebar = ({ onSelectRepo, isOpen, toggleSidebar, history }) => {
  const handleSelect = (item) => {
    if (onSelectRepo) onSelectRepo(item.repoUrl);
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>  
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      {isOpen && (
        <div className={styles.content}>
          <div className={styles.header}><FaHistory className={styles.icon}/> History</div>
          <ul className={styles.historyList}>
            {history.length === 0 && (
              <li className={styles.empty}>No history yet.</li>
            )}
            {history.map((item, idx) => (
              <li
                key={item.repoUrl + item.timestamp}
                className={styles.historyItem}
                onClick={() => handleSelect(item)}
                style={{ marginBottom: idx !== history.length - 1 ? '0px' : '0' }}
              >
                <span className={styles.repoName}>{item.name}</span>
                <span className={styles.timestamp}>{formatTimestamp(item.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistorySidebar;
