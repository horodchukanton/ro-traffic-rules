import React from 'react'
import { render, screen } from '@testing-library/react'
import Quiz from './Quiz'

// Mock useQuiz hook
vi.mock('../hooks/useQuiz', () => ({
  default: vi.fn()
}))

import useQuiz from '../hooks/useQuiz'

describe('Quiz Component', () => {
  const mockUseQuiz = {
    questions: [],
    loading: false,
    error: null,
    currentQuestionIndex: 0,
    currentQuestion: null,
    score: 0,
    answers: {},
    answerQuestion: vi.fn(),
    nextQuestion: vi.fn(),
    previousQuestion: vi.fn(),
    resetQuiz: vi.fn(),
    loadQuestions: vi.fn()
  }

  beforeEach(() => {
    useQuiz.mockReturnValue(mockUseQuiz)
  })

  test('shows loading state', () => {
    useQuiz.mockReturnValue({
      ...mockUseQuiz,
      loading: true
    })

    render(<Quiz />)
    
    expect(screen.getByText('Loading questions from questions.yaml...')).toBeInTheDocument()
  })

  test('shows error state', () => {
    useQuiz.mockReturnValue({
      ...mockUseQuiz,
      error: 'Failed to load questions'
    })

    render(<Quiz />)
    
    expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument()
    expect(screen.getByText('Failed to load questions')).toBeInTheDocument()
  })

  test('shows quiz complete state', () => {
    const mockQuestions = [
      { id: 1, text: 'Question 1', type: 'single', options: ['A', 'B'], correct: 0 }
    ]

    useQuiz.mockReturnValue({
      ...mockUseQuiz,
      questions: mockQuestions,
      currentQuestionIndex: 1, // Beyond the last question
      score: 1,
      getQuizStatistics: vi.fn(() => ({
        totalQuestions: 1,
        answeredQuestions: 1,
        correctAnswers: 1,
        wrongAnswers: 0,
        accuracy: 100,
        categoryStats: {},
        missedCategories: [],
        wrongAnswerDetails: []
      }))
    })

    render(<Quiz />)
    
    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument()
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument()
    expect(screen.getByText('Start Over')).toBeInTheDocument()
  })

  test('shows quiz content when questions are loaded', () => {
    const mockQuestion = {
      id: 1,
      text: 'What is the speed limit?',
      type: 'single',
      options: ['50 km/h', '60 km/h'],
      correct: 0
    }

    useQuiz.mockReturnValue({
      ...mockUseQuiz,
      questions: [mockQuestion],
      currentQuestion: mockQuestion,
      currentQuestionIndex: 0
    })

    render(<Quiz />)
    
    expect(screen.getByText('Your Progress')).toBeInTheDocument()
    expect(screen.getAllByText(/Question 1 of 1/)[0]).toBeInTheDocument()
    expect(screen.getByText('Score:')).toBeInTheDocument()
  })

  test('shows navigation buttons', () => {
    const mockQuestion = {
      id: 1,
      text: 'What is the speed limit?',
      type: 'single',
      options: ['50 km/h', '60 km/h'],
      correct: 0
    }

    useQuiz.mockReturnValue({
      ...mockUseQuiz,
      questions: [mockQuestion, mockQuestion], // Two questions
      currentQuestion: mockQuestion,
      currentQuestionIndex: 0
    })

    render(<Quiz />)
    
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })
})