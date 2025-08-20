import React, { useState } from 'react';
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
  const [selectedOptions, setSelectedOptions] = useState([]);

  if (!question) {
    return <div className={styles.question}>Loading question...</div>;
  }

  const isMultipleChoice = question.type === 'multiple';

  const handleOptionClick = (index) => {
    if (isMultipleChoice) {
      const newSelected = selectedOptions.includes(index)
        ? selectedOptions.filter(i => i !== index)
        : [...selectedOptions, index];
      setSelectedOptions(newSelected);
    } else {
      onAnswer(index);
    }
  };

  const handleSubmitMultiple = () => {
    onAnswer(selectedOptions);
  };

  return (
    <div className={styles.question}>
      <div className={styles.header}>
        <span className={styles.counter}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {question.category && (
          <span className={styles.category}>{question.category}</span>
        )}
      </div>
      
      <h3 className={styles.text}>{question.text}</h3>
      
      {question.image && (
        <div className={styles.imageContainer}>
          <img src={question.image} alt="Question illustration" className={styles.image} />
        </div>
      )}
      
      {isMultipleChoice && (
        <p className={styles.instruction}>Select all correct answers:</p>
      )}
      
      <div className={styles.options}>
        {question.options?.map((option, index) => (
          <button 
            key={index} 
            className={`${styles.option} ${
              isMultipleChoice && selectedOptions.includes(index) ? styles.selected : ''
            }`}
            onClick={() => handleOptionClick(index)}
          >
            {isMultipleChoice && (
              <span className={styles.checkbox}>
                {selectedOptions.includes(index) ? '☑' : '☐'}
              </span>
            )}
            {option}
          </button>
        ))}
      </div>
      
      {isMultipleChoice && (
        <button 
          className={styles.submitButton}
          onClick={handleSubmitMultiple}
          disabled={selectedOptions.length === 0}
        >
          Submit Answer
        </button>
      )}
      
      {question.explanation && (
        <div className={styles.explanation}>
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}

export default Question;
