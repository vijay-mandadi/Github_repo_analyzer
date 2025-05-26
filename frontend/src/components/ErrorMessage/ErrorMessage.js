import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message }) => (
  message ? <div className={styles.error}>{message}</div> : null
);

export default ErrorMessage;
