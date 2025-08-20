import React from 'react';
import styles from './Results.module.css';

/**
 * Results component for displaying final quiz results
 * @param {Object} props - Component props
 * @param {number} props.score - User's final score
 * @param {number} props.totalQuestions - Total number of questions
 * @param {Function} props.onRestart - Callback to restart the quiz
 */
function Results({ score, totalQuestions, onRestart }) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className={styles.results}>
      <div className={styles.header}>
        <h2>Quiz Complete!</h2>
      </div>
      <div className={styles.scoreContainer}>
        <div className={styles.score}>
          <span className={styles.scoreValue}>{score}</span>
          <span className={styles.scoreDivider}>/</span>
          <span className={styles.scoreTotal}>{totalQuestions}</span>
        </div>
        <div className={styles.percentage}>{percentage}%</div>
      </div>
      <div className={styles.message}>
        {percentage >= 80 ? (
          <p className={styles.success}>Excellent! You passed the quiz.</p>
        ) : percentage >= 60 ? (
          <p className={styles.warning}>Good job! You can do even better.</p>
        ) : (
          <p className={styles.danger}>Keep practicing to improve your score.</p>
        )}
      </div>
      <div className={styles.actions}>
        <button className={styles.restartButton} onClick={onRestart}>
          Start Over
        </button>
      </div>
    </div>
  );
}

export default Results;
