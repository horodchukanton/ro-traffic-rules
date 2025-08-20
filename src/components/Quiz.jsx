import React from 'react';
import useQuiz from '../hooks/useQuiz';
import Question from './Question';
import LoadingSpinner from './LoadingSpinner';
import styles from './Quiz.module.css';

/**
 * Main Quiz component that displays questions loaded from questions.yaml
 * and manages quiz flow using the useQuiz hook for state management
 */
function Quiz() {
  const {
    questions,
    currentQuestion,
    currentQuestionIndex,
    loading,
    error,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    retryLoading,
    score,
    storageAvailable,
    retryCount
  } = useQuiz();

  if (loading) {
    const loadingMessage = retryCount > 0 
      ? `Loading questions... (Attempt ${retryCount + 1})`
      : 'Loading questions from questions.yaml...';
      
    return (
      <div className={styles.quiz}>
        <LoadingSpinner message={loadingMessage} size="large" />
      </div>
    );
  }

  if (error) {
    const canRetry = retryCount < 3; // Allow up to 3 retry attempts
    
    return (
      <div className={styles.quiz}>
        <div className={styles.error}>
          <h3>Unable to Load Quiz</h3>
          <p className={styles.errorMessage}>{error}</p>
          
          {!storageAvailable && (
            <div className={styles.storageWarning}>
              <p>⚠️ Storage is unavailable. Your progress will not be saved.</p>
            </div>
          )}
          
          <div className={styles.errorActions}>
            {canRetry && (
              <button 
                onClick={retryLoading} 
                className={styles.retryButton}
              >
                Try Again
              </button>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className={styles.reloadButton}
            >
              Reload Page
            </button>
          </div>
          
          {retryCount >= 3 && (
            <div className={styles.troubleshooting}>
              <details>
                <summary>Troubleshooting Tips</summary>
                <ul>
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Try accessing the site in a different browser</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={styles.quiz}>
        <div className={styles.error}>
          <h3>No Questions Available</h3>
          <p>The quiz questions could not be loaded or the questions file is empty.</p>
          <div className={styles.errorActions}>
            <button 
              onClick={retryLoading} 
              className={styles.retryButton}
            >
              Retry Loading
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.reloadButton}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isQuizComplete = currentQuestionIndex >= questions.length;

  if (isQuizComplete) {
    return (
      <div className={styles.quiz}>
        <div className={styles.results}>
          <h2>Quiz Complete!</h2>
          <p>Your score: {score} out of {questions.length}</p>
          <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
          <button onClick={resetQuiz} className={styles.resetButton}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quiz}>
      {!storageAvailable && (
        <div className={styles.storageWarning}>
          <p>⚠️ Storage unavailable. Your progress will not be saved between sessions.</p>
        </div>
      )}
      
      <div className={styles.header}>
        <h2>Traffic Rules Quiz</h2>
        <p>Answer the questions below to test your knowledge</p>
        <div className={styles.progress}>
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
      </div>
      
      <div className={styles.content}>
        {currentQuestion && (
          <Question
            question={currentQuestion}
            onAnswer={answerQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
          />
        )}
        
        <div className={styles.navigation}>
          <button 
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className={styles.navButton}
          >
            Previous
          </button>
          <button 
            onClick={nextQuestion}
            disabled={currentQuestionIndex >= questions.length - 1}
            className={styles.navButton}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
