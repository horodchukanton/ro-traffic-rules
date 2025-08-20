import React from 'react';
import styles from './Question.module.css';

/**
 * Question component for displaying individual quiz questions
 * @param {Object} props - Component props
 * @param {Object} props.question - Question object with text, options, etc.
 * @param {Function} props.onAnswer - Callback when user selects an answer
 * @param {number} props.currentIndex - Current question index
 * @param {number} props.totalQuestions - Total number of questions
 */
function Question({ question, onAnswer, currentIndex, totalQuestions }) {
  if (!question) {
    return <div className={styles.question}>Loading question...</div>;
  }

  return (
    <div className={styles.question}>
      <div className={styles.header}>
        <span className={styles.counter}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>
      <h3 className={styles.text}>{question.question}</h3>
      <div className={styles.options}>
        {question.options?.map((option, index) => (
          <button key={index} className={styles.option} onClick={() => onAnswer(index)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Question;
