import React from 'react';
import './App.css';

/**
 * Main application component for Romanian Traffic Rules Quiz
 * This is the entry point of the application that will later integrate
 * with Quiz components and manage the overall application state.
 */
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Romanian Traffic Rules Quiz</h1>
        <p>Test your knowledge of Romanian traffic regulations</p>
      </header>
      <main className="app-main">
        <div className="quiz-container">
          <p>Welcome to the Romanian Traffic Rules training application!</p>
          <p>This application will help you prepare for the Romanian traffic rules examination.</p>
          <p>Questions are loaded from questions.yaml and your progress is saved locally.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
