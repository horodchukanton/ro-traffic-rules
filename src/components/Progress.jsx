import React from 'react';
import styles from './Progress.module.css';

/**
 * Progress component for displaying user's quiz progress
 * @param {Object} props - Component props
 * @param {number} props.currentQuestion - Current question index
 * @param {number} props.totalQuestions - Total number of questions
 * @param {number} props.score - Current score
 * @param {Object} props.answers - User's answers object
 */
function Progress({ currentQuestion, totalQuestions, score, answers }) {
  const progressPercentage =
    totalQuestions > 0 ? Math.round(((currentQuestion + 1) / totalQuestions) * 100) : 0;
  const answeredQuestions = Object.keys(answers || {}).length;

  return (
    <div className={styles.progress}>
      <div className={styles.header}>
        <h3>Your Progress</h3>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Question:</span>
          <span className={styles.statValue}>
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>Answered:</span>
          <span className={styles.statValue}>{answeredQuestions}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>Score:</span>
          <span className={styles.statValue}>{score}</span>
        </div>
      </div>
    </div>
  );
}

export default Progress;
