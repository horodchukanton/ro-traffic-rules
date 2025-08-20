import { useEffect, useReducer, useRef } from 'react';
import yaml from 'js-yaml';
import useStorage from './useStorage';

/**
 * @typedef {Object} Question
 * @property {number} id - Unique identifier for the question
 * @property {string} category - Category/topic of the question (e.g., "Speed limits", "Parking")
 * @property {"single"|"multiple"|"image"} type - Type of question
 * @property {string} text - The question text to display
 * @property {string[]} options - Array of answer options
 * @property {string|string[]} correct - Correct answer(s) - string for single choice, array for multiple choice
 * @property {string} [explanation] - Optional explanation of the correct answer
 * @property {string} [image] - Optional image URL for visual questions
 */

/**
 * @typedef {Object} QuizState
 * @property {Question[]} questions - Array of quiz questions loaded from YAML
 * @property {number} currentQuestionIndex - Index of the currently displayed question
 * @property {Object.<number, number|number[]>} answers - User's answers mapped by question ID
 * @property {number} score - Current score (number of correct answers)
 * @property {boolean} loading - Whether questions are currently being loaded
 * @property {string|null} error - Error message if loading failed
 */

/**
 * Quiz state reducer
 */
const quizReducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, loading: false };
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestionIndex: action.payload };
    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
        score: action.payload.isCorrect ? state.score + 1 : state.score,
      };
    case 'RESTORE_ANSWERS':
      return {
        ...state,
        answers: action.payload.answers,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET_QUIZ':
      return {
        ...state,
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        error: null,
      };
    default:
      return state;
  }
};

/**
 * Custom hook for managing quiz logic and state
 * This hook encapsulates all quiz-related functionality including:
 * - Loading questions from questions.yaml
 * - Managing current question state
 * - Handling user answers
 * - Calculating scores
 * - Persisting progress to localStorage
 */
function useQuiz() {
  const storage = useStorage();
  const hasLoadedRef = useRef(false);

  const [state, dispatch] = useReducer(quizReducer, {
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
    loading: true,
    error: null,
  });

  /**
   * Load questions from questions.yaml file
   */
  const loadQuestions = async () => {
    if (hasLoadedRef.current) return; // Prevent multiple loads
    hasLoadedRef.current = true;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/questions.yaml');
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status}`);
      }

      const yamlText = await response.text();
      const data = yaml.load(yamlText);

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid questions format in YAML file');
      }

      dispatch({ type: 'SET_QUESTIONS', payload: data.questions });

      // Load saved progress
      const savedProgress = storage.getItem('quizProgress');
      if (savedProgress) {
        dispatch({
          type: 'SET_CURRENT_QUESTION',
          payload: savedProgress.currentQuestionIndex || 0,
        });
        // Restore answers by updating the state directly via a new action type
        dispatch({ 
          type: 'RESTORE_ANSWERS', 
          payload: { answers: savedProgress.answers || {} } 
        });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }; // Remove storage dependency

  /**
   * Handle user answer
   * @param {number|Array} answer - The selected answer index or array of indices for multiple choice
   */
  const answerQuestion = answer => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    let isCorrect;
    
    if (currentQuestion.type === 'multiple') {
      // For multiple choice questions, correct answer is an array of strings
      const correctAnswers = currentQuestion.correct;
      const userAnswers = Array.isArray(answer) ? answer : [answer];
      
      // Check if user selected all correct answers and no incorrect ones
      isCorrect = correctAnswers.length === userAnswers.length &&
        correctAnswers.every(correctAnswer => {
          const correctIndex = currentQuestion.options.indexOf(correctAnswer);
          return userAnswers.includes(correctIndex);
        });
    } else {
      // For single choice questions, correct answer is a string
      const correctIndex = currentQuestion.options.indexOf(currentQuestion.correct);
      isCorrect = answer === correctIndex;
    }

    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        questionId: currentQuestion.id,
        answer: answer,
        isCorrect,
      },
    });

    // Save progress to localStorage
    const progress = {
      currentQuestionIndex: state.currentQuestionIndex,
      answers: { ...state.answers, [currentQuestion.id]: answer },
      score: isCorrect ? state.score + 1 : state.score,
    };
    storage.setItem('quizProgress', progress);
  };

  /**
   * Move to next question
   */
  const nextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      const newIndex = state.currentQuestionIndex + 1;
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: newIndex });

      // Update saved progress
      const progress = storage.getItem('quizProgress') || {};
      storage.setItem('quizProgress', { ...progress, currentQuestionIndex: newIndex });
    }
  };

  /**
   * Move to previous question
   */
  const previousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      const newIndex = state.currentQuestionIndex - 1;
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: newIndex });

      // Update saved progress
      const progress = storage.getItem('quizProgress') || {};
      storage.setItem('quizProgress', { ...progress, currentQuestionIndex: newIndex });
    }
  };

  /**
   * Reset quiz progress
   */
  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    storage.removeItem('quizProgress');
  };

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []); // No dependencies - loads only once

  return {
    ...state,
    currentQuestion: state.questions[state.currentQuestionIndex],
    answerQuestion,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    loadQuestions,
  };
}

export default useQuiz;
