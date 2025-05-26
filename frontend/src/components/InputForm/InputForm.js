import React from 'react';
import styles from './InputForm.module.css';

const InputForm = ({ repoUrl, setRepoUrl, onAnalyze, loading }) => (
  <form className={styles.form} onSubmit={onAnalyze}>
    <input
      type="text"
      className={styles.input}
      placeholder="Enter public GitHub repo URL"
      value={repoUrl}
      onChange={e => setRepoUrl(e.target.value)}
      disabled={loading}
      required
    />
    <button
      type="submit"
      className={styles.button}
      disabled={loading || !repoUrl.trim()}
    >
      {loading ? 'Analyzing...' : 'Analyze'}
    </button>
  </form>
);

export default InputForm;
