import { useEffect, useReducer, useCallback } from 'react';
import yaml from 'js-yaml';
import useStorage from './useStorage';

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
  const loadQuestions = useCallback(async () => {
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
        dispatch({ type: 'ANSWER_QUESTION', payload: { answers: savedProgress.answers || {} } });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [storage]);

  /**
   * Handle user answer
   * @param {number} answerIndex - The index of the selected answer
   */
  const answerQuestion = answerIndex => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correct;

    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        questionId: currentQuestion.id,
        answer: answerIndex,
        isCorrect,
      },
    });

    // Save progress to localStorage
    const progress = {
      currentQuestionIndex: state.currentQuestionIndex,
      answers: { ...state.answers, [currentQuestion.id]: answerIndex },
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
  }, [loadQuestions]);

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
