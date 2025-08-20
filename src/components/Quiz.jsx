import React from 'react';
import styles from './Quiz.module.css';

/**
 * Main Quiz component that will display questions and manage quiz flow
 * This component will be integrated with useQuiz hook for state management
 * and will handle the display of questions from questions.yaml
 */
function Quiz() {
  return (
    <div className={styles.quiz}>
      <div className={styles.header}>
        <h2>Traffic Rules Quiz</h2>
        <p>Answer the questions below to test your knowledge</p>
      </div>
      <div className={styles.content}>
        <p>Quiz component is ready - questions will be loaded here</p>
      </div>
    </div>
  );
}

export default Quiz;
