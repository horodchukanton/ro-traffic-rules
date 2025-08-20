import React, { useState } from 'react';
import styles from './Results.module.css';

/**
 * Results component for displaying final quiz results with detailed statistics
 * @param {Object} props - Component props
 * @param {number} props.score - User's final score
 * @param {number} props.totalQuestions - Total number of questions
 * @param {Function} props.onRestart - Callback to restart the quiz
 * @param {Function} props.getQuizStatistics - Function to get detailed quiz statistics
 */
function Results({ score, totalQuestions, onRestart, getQuizStatistics }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const statistics = getQuizStatistics ? getQuizStatistics() : null;

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

      {statistics && (
        <div className={styles.statistics}>
          <div className={styles.statisticsHeader}>
            <h3>Quiz Statistics</h3>
            <button 
              className={styles.detailsButton}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className={styles.basicStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Questions Answered:</span>
              <span className={styles.statValue}>{statistics.answeredQuestions}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Accuracy:</span>
              <span className={styles.statValue}>{Math.round(statistics.accuracy)}%</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Wrong Answers:</span>
              <span className={styles.statValue}>{statistics.wrongAnswers}</span>
            </div>
          </div>

          {showDetails && (
            <div className={styles.detailedStats}>
              {statistics.missedCategories.length > 0 && (
                <div className={styles.missedCategories}>
                  <h4>Areas for Improvement</h4>
                  <div className={styles.categoryList}>
                    {statistics.missedCategories.slice(0, 5).map((category) => (
                      <div key={category.category} className={styles.categoryItem}>
                        <span className={styles.categoryName}>{category.category}</span>
                        <span className={styles.categoryAccuracy}>
                          {Math.round(category.accuracy * 100)}% ({category.missed} wrong)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {statistics.wrongAnswerDetails.length > 0 && (
                <div className={styles.wrongAnswers}>
                  <h4>Questions You Got Wrong</h4>
                  <div className={styles.wrongAnswerList}>
                    {statistics.wrongAnswerDetails.map((answer) => (
                      <div key={answer.id} className={styles.wrongAnswerItem}>
                        <div className={styles.questionText}>{answer.text}</div>
                        <div className={styles.answerDetails}>
                          <span className={styles.correctAnswer}>
                            Correct: {Array.isArray(answer.correctAnswer) 
                              ? answer.correctAnswer.join(', ') 
                              : answer.correctAnswer}
                          </span>
                          <span className={styles.category}>Category: {answer.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className={styles.actions}>
        <button className={styles.restartButton} onClick={onRestart}>
          Start Over
        </button>
      </div>
    </div>
  );
}

export default Results;
