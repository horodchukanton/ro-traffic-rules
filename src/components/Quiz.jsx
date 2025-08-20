import React from 'react';
import useQuiz from '../hooks/useQuiz';
import Question from './Question';
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
    score
  } = useQuiz();

  if (loading) {
    return (
      <div className={styles.quiz}>
        <div className={styles.loading}>
          <p>Loading questions from questions.yaml...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.quiz}>
        <div className={styles.error}>
          <h3>Error loading quiz</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={styles.quiz}>
        <div className={styles.error}>
          <p>No questions available</p>
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
