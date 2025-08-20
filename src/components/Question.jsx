import React, { useState, useEffect } from 'react';
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
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  if (!question) {
    return <div className={styles.question}>Loading question...</div>;
  }

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setAnswerSubmitted(false);
    setSelectedAnswer(null);
  }, [question.id]);

  const isMultipleChoice = question.type === 'multiple';

  // Function to check if an answer is correct
  const isAnswerCorrect = (answer) => {
    if (isMultipleChoice) {
      const correctAnswers = question.correct;
      const userAnswers = Array.isArray(answer) ? answer : [answer];
      return correctAnswers.length === userAnswers.length &&
        correctAnswers.every(correctAnswer => {
          const correctIndex = question.options.indexOf(correctAnswer);
          return userAnswers.includes(correctIndex);
        });
    } else {
      const correctIndex = question.options.indexOf(question.correct);
      return answer === correctIndex;
    }
  };

  // Function to get the correct answer index(es)
  const getCorrectAnswerIndices = () => {
    if (isMultipleChoice) {
      return question.correct.map(correctAnswer => 
        question.options.indexOf(correctAnswer)
      );
    } else {
      return [question.options.indexOf(question.correct)];
    }
  };

  const correctIndices = getCorrectAnswerIndices();

  const handleOptionClick = (index) => {
    // Don't allow changes after answer is submitted
    if (answerSubmitted) return;

    if (isMultipleChoice) {
      const newSelected = selectedOptions.includes(index)
        ? selectedOptions.filter(i => i !== index)
        : [...selectedOptions, index];
      setSelectedOptions(newSelected);
    } else {
      // For single choice, immediately submit the answer
      setSelectedAnswer(index);
      setAnswerSubmitted(true);
      onAnswer(index);
    }
  };

  const handleSubmitMultiple = () => {
    if (selectedOptions.length === 0 || answerSubmitted) return;
    
    setSelectedAnswer(selectedOptions);
    setAnswerSubmitted(true);
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
        {question.options?.map((option, index) => {
          let optionClassName = styles.option;
          
          // Add selection state for multiple choice
          if (isMultipleChoice && selectedOptions.includes(index)) {
            optionClassName += ` ${styles.selected}`;
          }
          
          // Add feedback styling after answer is submitted
          if (answerSubmitted) {
            if (correctIndices.includes(index)) {
              optionClassName += ` ${styles.correct}`;
            } else if (
              (isMultipleChoice && selectedOptions.includes(index)) ||
              (!isMultipleChoice && selectedAnswer === index)
            ) {
              optionClassName += ` ${styles.incorrect}`;
            }
          }
          
          return (
            <button 
              key={index} 
              className={optionClassName}
              onClick={() => handleOptionClick(index)}
              disabled={answerSubmitted}
            >
              {isMultipleChoice && (
                <span className={styles.checkbox}>
                  {selectedOptions.includes(index) ? '☑' : '☐'}
                </span>
              )}
              {option}
            </button>
          );
        })}
      </div>
      
      {isMultipleChoice && (
        <button 
          className={styles.submitButton}
          onClick={handleSubmitMultiple}
          disabled={selectedOptions.length === 0 || answerSubmitted}
        >
          {answerSubmitted ? 'Answer Submitted' : 'Submit Answer'}
        </button>
      )}
      
      {answerSubmitted && question.explanation && (
        <div className={styles.explanation}>
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}

export default Question;
