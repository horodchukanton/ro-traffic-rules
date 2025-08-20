import { renderHook, act } from '@testing-library/react'
import useQuiz from './useQuiz'

// Mock fetch and yaml to avoid complex async testing
vi.mock('js-yaml', () => ({
  default: {
    load: vi.fn(() => ({ 
      questions: [
        {
          id: 1,
          category: 'Speed limits',
          type: 'single',
          text: 'What is the speed limit?',
          options: ['50 km/h', '60 km/h', '70 km/h'],
          correct: '50 km/h',
          explanation: 'Standard urban speed limit'
        },
        {
          id: 2,
          category: 'Speed limits',
          type: 'multiple',
          text: 'Which are speed limit signs?',
          options: ['50 km/h sign', '60 km/h sign', 'Stop sign', 'Yield sign'],
          correct: ['50 km/h sign', '60 km/h sign'],
          explanation: 'Speed limit signs show numerical values'
        },
        {
          id: 3,
          category: 'Traffic signs',
          type: 'single',
          text: 'What does a stop sign mean?',
          options: ['Slow down', 'Complete stop', 'Yield'],
          correct: 'Complete stop',
          explanation: 'Stop signs require complete stop'
        }
      ]
    }))
  },
  load: vi.fn(() => ({ 
    questions: [
      {
        id: 1,
        category: 'Speed limits',
        type: 'single',
        text: 'What is the speed limit?',
        options: ['50 km/h', '60 km/h', '70 km/h'],
        correct: '50 km/h',
        explanation: 'Standard urban speed limit'
      },
      {
        id: 2,
        category: 'Speed limits',
        type: 'multiple',
        text: 'Which are speed limit signs?',
        options: ['50 km/h sign', '60 km/h sign', 'Stop sign', 'Yield sign'],
        correct: ['50 km/h sign', '60 km/h sign'],
        explanation: 'Speed limit signs show numerical values'
      },
      {
        id: 3,
        category: 'Traffic signs',
        type: 'single',
        text: 'What does a stop sign mean?',
        options: ['Slow down', 'Complete stop', 'Yield'],
        correct: 'Complete stop',
        explanation: 'Stop signs require complete stop'
      }
    ]
  }))
}))

global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('questions: []')
  })
)

describe('useQuiz', () => {
  beforeEach(() => {
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()
    localStorage.removeItem.mockClear()
    fetch.mockClear()
  })

  test('initializes with correct default state', () => {
    // Act
    const { result } = renderHook(() => useQuiz())

    // Assert initial state
    expect(result.current.questions).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.currentQuestionIndex).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.answers).toEqual({})
  })

  test('provides progress calculations', async () => {
    const { result } = renderHook(() => useQuiz())

    // Wait for questions to load (using the mocked 3 questions)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Check progress calculations - adjust to expected mock data with 3 questions
    expect(result.current.progress).toBeDefined()
    expect(result.current.progress.totalQuestions).toBe(3) // Adjusted to match mock
    expect(result.current.progress.answeredQuestions).toBe(0)
    expect(result.current.progress.progressPercentage).toBe(0)
    expect(result.current.progress.isComplete).toBe(false)
  })

  test('provides category statistics', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(`
questions:
  - id: 1
    category: 'Speed limits'
    type: 'single'
    text: 'What is the speed limit?'
    options: ['50 km/h', '60 km/h']
    correct: '50 km/h'
  - id: 2
    category: 'Speed limits'
    type: 'single'
    text: 'Another speed question?'
    options: ['70 km/h', '80 km/h']
    correct: '70 km/h'
      `)
    })

    const { result } = renderHook(() => useQuiz())

    // Wait for questions to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Check category stats
    expect(result.current.categoryStats).toBeDefined()
    expect(result.current.categoryStats['Speed limits']).toBeDefined()
    expect(result.current.categoryStats['Speed limits'].total).toBe(2)
    expect(result.current.categoryStats['Speed limits'].answered).toBe(0)
  })

  test('provides answer analysis', async () => {
    const { result } = renderHook(() => useQuiz())

    // Wait for questions to load (using the mocked 3 questions)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Check answer analysis - adjust to expected mock data with 3 questions
    expect(result.current.answerAnalysis).toBeDefined()
    expect(result.current.answerAnalysis.correctAnswers).toEqual([])
    expect(result.current.answerAnalysis.incorrectAnswers).toEqual([])
    expect(result.current.answerAnalysis.unanswered).toHaveLength(3) // Adjusted to match mock
  })

  test('resets quiz state correctly', () => {
    // Arrange
    const { result } = renderHook(() => useQuiz())

    // Act
    act(() => {
      result.current.resetQuiz()
    })

    // Assert
    expect(result.current.score).toBe(0)
    expect(result.current.currentQuestionIndex).toBe(0)
    expect(result.current.answers).toEqual({})
    expect(localStorage.removeItem).toHaveBeenCalledWith('quizProgress')
  })

  test('calls fetch on initialization', () => {
    // Act
    renderHook(() => useQuiz())

    // Assert
    expect(fetch).toHaveBeenCalledWith('./questions.yaml', {
      signal: expect.any(AbortSignal),
      cache: 'no-cache'
    })
  })

  test('provides all required methods', () => {
    // Act
    const { result } = renderHook(() => useQuiz())

    // Assert
    expect(typeof result.current.answerQuestion).toBe('function')
    expect(typeof result.current.nextQuestion).toBe('function')
    expect(typeof result.current.previousQuestion).toBe('function')
    expect(typeof result.current.resetQuiz).toBe('function')
    expect(typeof result.current.loadQuestions).toBe('function')
  })

  test('calculates progress correctly after answering questions', async () => {
    const { result } = renderHook(() => useQuiz())

    // Wait for questions to load (using the mocked 3 questions)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Answer first question correctly (index 0 for '50 km/h')
    act(() => {
      result.current.answerQuestion(0)
    })

    // Check updated progress - adjust to expected mock data with 3 questions  
    expect(result.current.progress.answeredQuestions).toBe(1)
    expect(result.current.progress.progressPercentage).toBe(33) // 1/3 = 33%
    expect(result.current.score).toBe(1)
    expect(result.current.progress.scorePercentage).toBe(33) // 1/3 = 33%
  })

  test('tracks category statistics correctly', async () => {
    const mockYaml = `
questions:
  - id: 1
    category: 'Speed limits'
    type: 'single'
    text: 'What is the speed limit?'
    options: ['50 km/h', '60 km/h']
    correct: '50 km/h'
  - id: 2
    category: 'Speed limits'
    type: 'single'
    text: 'Highway speed?'
    options: ['90 km/h', '100 km/h']
    correct: '90 km/h'
    `
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockYaml)
    })

    const { result } = renderHook(() => useQuiz())

    // Wait for questions to load  
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Answer first question correctly
    act(() => {
      result.current.answerQuestion(0) // Correct answer for '50 km/h'
    })

    // Check category stats
    const speedLimitsStats = result.current.categoryStats['Speed limits']
    expect(speedLimitsStats.total).toBe(2)
    expect(speedLimitsStats.answered).toBe(1)
    expect(speedLimitsStats.correct).toBe(1)
    expect(speedLimitsStats.incorrect).toBe(0)
    expect(speedLimitsStats.correctPercentage).toBe(100)
    expect(speedLimitsStats.progressPercentage).toBe(50)
  })
})