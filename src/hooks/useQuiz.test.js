import { renderHook, act } from '@testing-library/react'
import useQuiz from './useQuiz'

// Mock fetch and yaml to avoid complex async testing
vi.mock('js-yaml', () => ({
  default: {
    load: vi.fn(() => ({ questions: [] }))
  },
  load: vi.fn(() => ({ questions: [] }))
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
})