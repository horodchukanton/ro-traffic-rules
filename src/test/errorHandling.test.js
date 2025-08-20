import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useQuiz from '../hooks/useQuiz';

// Mock dependencies
vi.mock('js-yaml', () => ({
  default: {
    load: vi.fn()
  },
  load: vi.fn()
}));

vi.mock('../hooks/useStorage', () => ({
  default: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(() => true),
    removeItem: vi.fn(() => true),
    isStorageAvailable: true
  }))
}));

import yaml from 'js-yaml';

// Mock fetch globally
global.fetch = vi.fn();

describe('Error Handling Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mocks
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('handles network connection errors', async () => {
    // Arrange
    fetch.mockRejectedValue(new Error('Failed to fetch'));

    // Act
    const { result } = renderHook(() => useQuiz());

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Network connection issue');
    expect(result.current.questions).toEqual([]);
  });

  test('handles 404 errors when questions file not found', async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Questions file not found');
  });

  test('handles empty YAML file', async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('')
    });

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Questions file is empty');
  });

  test('handles invalid YAML format', async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('invalid: yaml: content: [')
    });
    yaml.load.mockImplementation(() => {
      throw new Error('Invalid YAML');
    });

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Unable to load quiz questions');
  });

  test('handles missing questions array in YAML', async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('meta: some data')
    });
    yaml.load.mockReturnValue({ meta: 'some data' });

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('questions file format is invalid');
  });

  test('handles empty questions array', async () => {
    // Arrange
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('questions: []')
    });
    yaml.load.mockReturnValue({ questions: [] });

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Questions file contains no questions');
  });

  test('handles malformed question data', async () => {
    // Arrange
    const invalidQuestions = [
      { id: 1, text: 'Question 1' }, // Missing options and correct
      { id: 2, options: ['A', 'B'] }, // Missing text and correct
    ];
    
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('questions: []')
    });
    yaml.load.mockReturnValue({ questions: invalidQuestions });

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Invalid question format found');
  });

  test('handles request timeout', async () => {
    // Arrange - Mock AbortError for timeout
    fetch.mockRejectedValue(new Error('The operation was aborted due to timeout'));

    // Act
    const { result } = renderHook(() => useQuiz());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain('Request timed out');
  });

  test('retry functionality works correctly', async () => {
    // Arrange
    fetch
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('questions: [{id: 1, text: "Test", options: ["A"], correct: "A"}]')
      });
    
    yaml.load.mockReturnValue({
      questions: [{ id: 1, text: 'Test', options: ['A'], correct: 'A' }]
    });

    // Act
    const { result } = renderHook(() => useQuiz());

    // Wait for initial error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();

    // Retry
    await act(async () => {
      result.current.retryLoading();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.questions).toHaveLength(1);
  });

  test('tracks retry count correctly', async () => {
    // Arrange
    fetch.mockRejectedValue(new Error('Failed to fetch'));

    // Act
    const { result } = renderHook(() => useQuiz());

    // Wait for initial error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.retryCount).toBe(1);

    // Retry again
    await act(async () => {
      result.current.retryLoading();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.retryCount).toBe(2);
  });
});