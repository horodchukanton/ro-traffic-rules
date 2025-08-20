import { renderHook, act } from '@testing-library/react'
import useStorage from './useStorage'

describe('useStorage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    localStorage.getItem.mockClear()
    localStorage.setItem.mockClear()
    localStorage.removeItem.mockClear()
    localStorage.clear.mockClear()
  })

  test('should get item from localStorage', () => {
    // Arrange
    const key = 'testKey'
    const value = { test: 'data' }
    localStorage.getItem.mockReturnValue(JSON.stringify(value))
    
    // Act
    const { result } = renderHook(() => useStorage())
    const retrieved = result.current.getItem(key)
    
    // Assert
    expect(localStorage.getItem).toHaveBeenCalledWith(key)
    expect(retrieved).toEqual(value)
  })

  test('should return default value when key does not exist', () => {
    // Arrange
    const key = 'nonExistentKey'
    const defaultValue = 'default'
    localStorage.getItem.mockReturnValue(null)
    
    // Act
    const { result } = renderHook(() => useStorage())
    const retrieved = result.current.getItem(key, defaultValue)
    
    // Assert
    expect(localStorage.getItem).toHaveBeenCalledWith(key)
    expect(retrieved).toBe(defaultValue)
  })

  test('should set item to localStorage', () => {
    // Arrange
    const key = 'testKey'
    const value = { test: 'data' }
    
    // Act
    const { result } = renderHook(() => useStorage())
    act(() => {
      result.current.setItem(key, value)
    })
    
    // Assert
    expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value))
  })

  test('should remove item from localStorage', () => {
    // Arrange
    const key = 'testKey'
    
    // Act
    const { result } = renderHook(() => useStorage())
    act(() => {
      result.current.removeItem(key)
    })
    
    // Assert
    expect(localStorage.removeItem).toHaveBeenCalledWith(key)
  })

  test('should clear localStorage', () => {
    // Act
    const { result } = renderHook(() => useStorage())
    act(() => {
      result.current.clear()
    })
    
    // Assert
    expect(localStorage.clear).toHaveBeenCalled()
  })

  test('should handle JSON parse errors gracefully', () => {
    // Arrange
    const key = 'invalidKey'
    const defaultValue = 'fallback'
    localStorage.getItem.mockReturnValue('invalid json')
    
    // Act
    const { result } = renderHook(() => useStorage())
    const retrieved = result.current.getItem(key, defaultValue)
    
    // Assert
    expect(retrieved).toBe(defaultValue)
  })
})