import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * Loading spinner component with customizable message
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size of spinner ('small', 'medium', 'large')
 */
function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;