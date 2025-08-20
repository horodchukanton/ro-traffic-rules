import React from 'react';
import Quiz from './components/Quiz';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

/**
 * Main application component for Romanian Traffic Rules Quiz
 * This is the entry point that displays the quiz loaded from questions.yaml
 * Wrapped with ErrorBoundary to catch and handle component errors gracefully
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>Romanian Traffic Rules Quiz</h1>
          <p>Test your knowledge of Romanian traffic regulations</p>
        </header>
        <main className="app-main">
          <Quiz />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
