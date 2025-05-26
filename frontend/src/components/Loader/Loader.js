import React from 'react';
import styles from './Loader.module.css';

const Loader = () => (
  <div className={styles.loader}>
    <div className={styles.spinner}></div>
    <span>Analyzing... Please wait.</span>
  </div>
);

export default Loader;
