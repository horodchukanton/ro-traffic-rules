import React from 'react';
import Quiz from './components/Quiz';
import ErrorBoundary from './components/ErrorBoundary';
import styles from './App.module.css';

/**
 * Main application component for Romanian Traffic Rules Quiz
 * This is the entry point that displays the quiz loaded from questions.yaml
 * Wrapped with ErrorBoundary to catch and handle component errors gracefully
 */
function App() {
  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <h1>Romanian Traffic Rules Quiz</h1>
          <p>Test your knowledge of Romanian traffic regulations</p>
        </header>
        <main className={styles.appMain}>
          <Quiz />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
