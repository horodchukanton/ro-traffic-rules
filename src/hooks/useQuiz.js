import { useEffect, useReducer, useRef, useCallback } from 'react';
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
 * @property {number} retryCount - Number of retry attempts for loading questions
 */

/**
 * Quiz state reducer
 */
const quizReducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, loading: false, error: null };
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
      return { ...state, loading: action.payload, error: state.loading && !action.payload ? null : state.error };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_RETRY_COUNT':
      return { ...state, retryCount: action.payload };
    case 'RESET_QUIZ':
      return {
        ...state,
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        error: null,
        retryCount: 0,
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
    retryCount: 0,
  });

  /**
   * Get a user-friendly error message based on error type
   * @param {Error} error - The error object
   * @param {number} retryCount - Number of retry attempts
   * @returns {string} User-friendly error message
   */
  const getErrorMessage = (error, retryCount) => {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
      return `Network connection issue. Please check your internet connection and try again. ${retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}`;
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return 'Questions file not found. This might be a temporary issue with the server.';
    }
    
    if (errorMessage.includes('invalid questions format')) {
      return 'The questions file format is invalid. Please contact support if this issue persists.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Request timed out. The server might be busy. Please try again.';
    }
    
    // Generic error message
    return `Unable to load quiz questions: ${error.message}. ${retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}`;
  };

  /**
   * Load questions from questions.yaml file with retry logic
   * @param {boolean} isRetry - Whether this is a retry attempt
   */
  const loadQuestions = useCallback(async (isRetry = false) => {
    if (hasLoadedRef.current && !isRetry) return; // Prevent multiple loads
    
    if (!isRetry) {
      hasLoadedRef.current = true;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Add timeout for fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/questions.yaml', {
        signal: controller.signal,
        cache: 'no-cache', // Prevent caching issues
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
      }

      const yamlText = await response.text();
      
      if (!yamlText.trim()) {
        throw new Error('Questions file is empty');
      }

      const data = yaml.load(yamlText);

      if (!data) {
        throw new Error('Questions file contains no data');
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid questions format in YAML file - missing or invalid questions array');
      }

      if (data.questions.length === 0) {
        throw new Error('Questions file contains no questions');
      }

      // Validate question structure
      const invalidQuestions = data.questions.filter(q => 
        !q.id || !q.text || !q.options || !Array.isArray(q.options) || !q.correct
      );
      
      if (invalidQuestions.length > 0) {
        throw new Error(`Invalid question format found in ${invalidQuestions.length} question(s)`);
      }

      dispatch({ type: 'SET_QUESTIONS', payload: data.questions });

      // Load saved progress
      const savedProgress = storage.getItem('quizProgress');
      if (savedProgress) {
        dispatch({
          type: 'SET_CURRENT_QUESTION',
          payload: savedProgress.currentQuestionIndex || 0,
        });
        dispatch({ 
          type: 'RESTORE_ANSWERS', 
          payload: { answers: savedProgress.answers || {} } 
        });
      }
      
      // Reset retry count on success
      dispatch({ type: 'SET_RETRY_COUNT', payload: 0 });
      
    } catch (error) {
      console.error('Error loading questions:', error);
      
      const currentRetryCount = state.retryCount || 0;
      const userMessage = getErrorMessage(error, currentRetryCount);
      
      dispatch({ type: 'SET_ERROR', payload: userMessage });
      dispatch({ type: 'SET_RETRY_COUNT', payload: currentRetryCount + 1 });
    }
  }, [state.retryCount, storage]);

  /**
   * Retry loading questions
   */
  const retryLoading = useCallback(() => {
    loadQuestions(true);
  }, [loadQuestions]);

  /**
   * Handle user answer with error handling for storage
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

    // Save progress to storage with error handling
    try {
      const progress = {
        currentQuestionIndex: state.currentQuestionIndex,
        answers: { ...state.answers, [currentQuestion.id]: answer },
        score: isCorrect ? state.score + 1 : state.score,
      };
      
      const success = storage.setItem('quizProgress', progress);
      if (!success && storage.isStorageAvailable === false) {
        console.warn('Progress could not be saved: Storage unavailable. Progress will be lost on page refresh.');
      }
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
    }
  };

  /**
   * Move to next question with error handling for storage
   */
  const nextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      const newIndex = state.currentQuestionIndex + 1;
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: newIndex });

      // Update saved progress with error handling
      try {
        const progress = storage.getItem('quizProgress') || {};
        storage.setItem('quizProgress', { ...progress, currentQuestionIndex: newIndex });
      } catch (error) {
        console.error('Failed to save navigation progress:', error);
      }
    }
  };

  /**
   * Move to previous question with error handling for storage
   */
  const previousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      const newIndex = state.currentQuestionIndex - 1;
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: newIndex });

      // Update saved progress with error handling
      try {
        const progress = storage.getItem('quizProgress') || {};
        storage.setItem('quizProgress', { ...progress, currentQuestionIndex: newIndex });
      } catch (error) {
        console.error('Failed to save navigation progress:', error);
      }
    }
  };

  /**
   * Reset quiz progress with error handling for storage
   */
  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    
    try {
      storage.removeItem('quizProgress');
    } catch (error) {
      console.error('Failed to clear quiz progress:', error);
    }
    
    // Reset loading state for potential reload
    hasLoadedRef.current = false;
  };

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /**
   * Calculate quiz statistics for Results component
   */
  const getQuizStatistics = () => {
    if (!state.questions.length) return null;
    
    const questionStats = state.questions.map(question => {
      const userAnswer = state.answers[question.id];
      const isAnswered = userAnswer !== undefined;
      let isCorrect = false;
      
      if (isAnswered) {
        if (question.type === 'multiple') {
          const correctAnswers = question.correct;
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          isCorrect = correctAnswers.length === userAnswers.length &&
            correctAnswers.every(correctAnswer => {
              const correctIndex = question.options.indexOf(correctAnswer);
              return userAnswers.includes(correctIndex);
            });
        } else {
          const correctIndex = question.options.indexOf(question.correct);
          isCorrect = userAnswer === correctIndex;
        }
      }
      
      return {
        id: question.id,
        category: question.category,
        text: question.text,
        isAnswered,
        isCorrect,
        userAnswer,
        correctAnswer: question.correct,
        options: question.options
      };
    });
    
    const totalQuestions = state.questions.length;
    const answeredQuestions = questionStats.filter(q => q.isAnswered).length;
    const correctAnswers = questionStats.filter(q => q.isCorrect).length;
    const wrongAnswers = questionStats.filter(q => q.isAnswered && !q.isCorrect);
    
    // Category statistics
    const categoryStats = {};
    state.questions.forEach(question => {
      const stat = questionStats.find(s => s.id === question.id);
      if (!categoryStats[question.category]) {
        categoryStats[question.category] = {
          total: 0,
          answered: 0,
          correct: 0,
        };
      }
      categoryStats[question.category].total++;
      if (stat.isAnswered) {
        categoryStats[question.category].answered++;
        if (stat.isCorrect) {
          categoryStats[question.category].correct++;
        }
      }
    });
    
    // Most missed categories
    const missedCategories = Object.entries(categoryStats)
      .filter(([, stats]) => stats.answered > 0)
      .map(([category, stats]) => ({
        category,
        accuracy: stats.correct / stats.answered,
        missed: stats.answered - stats.correct,
        total: stats.answered
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
    
    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers: wrongAnswers.length,
      accuracy: answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0,
      categoryStats,
      missedCategories,
      wrongAnswerDetails: wrongAnswers
    };
  };

  return {
    ...state,
    currentQuestion: state.questions[state.currentQuestionIndex],
    answerQuestion,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    loadQuestions,
    retryLoading,
    storageAvailable: storage.isStorageAvailable,
    getQuizStatistics,
  };
}

export default useQuiz;
