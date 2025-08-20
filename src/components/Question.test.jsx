import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Question from './Question'

describe('Question Component', () => {
  const mockOnAnswer = vi.fn()

  const mockSingleChoiceQuestion = {
    id: 1,
    text: 'What is the speed limit in urban areas?',
    type: 'single',
    options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
    correct: 0,
    category: 'speed'
  }

  const mockMultipleChoiceQuestion = {
    id: 2,
    text: 'Which of the following are required when driving?',
    type: 'multiple',
    options: ['Seatbelt', 'Driver\'s license', 'Insurance', 'Sunglasses'],
    correct: [0, 1, 2],
    category: 'safety'
  }

  beforeEach(() => {
    mockOnAnswer.mockClear()
  })

  test('renders loading message when question is not provided', () => {
    render(
      <Question 
        question={null} 
        onAnswer={mockOnAnswer} 
        currentIndex={0} 
        totalQuestions={5} 
      />
    )
    
    expect(screen.getByText('Loading question...')).toBeInTheDocument()
  })

  test('renders single choice question correctly', () => {
    render(
      <Question 
        question={mockSingleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={0} 
        totalQuestions={5} 
      />
    )
    
    expect(screen.getByText('What is the speed limit in urban areas?')).toBeInTheDocument()
    expect(screen.getByText('50 km/h')).toBeInTheDocument()
    expect(screen.getByText('60 km/h')).toBeInTheDocument()
    expect(screen.getByText('70 km/h')).toBeInTheDocument()
    expect(screen.getByText('80 km/h')).toBeInTheDocument()
  })

  test('renders multiple choice question correctly', () => {
    render(
      <Question 
        question={mockMultipleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={1} 
        totalQuestions={5} 
      />
    )
    
    expect(screen.getByText('Which of the following are required when driving?')).toBeInTheDocument()
    expect(screen.getByText('Seatbelt')).toBeInTheDocument()
    expect(screen.getByText('Driver\'s license')).toBeInTheDocument()
    expect(screen.getByText('Insurance')).toBeInTheDocument()
    expect(screen.getByText('Sunglasses')).toBeInTheDocument()
  })

  test('handles single choice question selection', async () => {
    const user = userEvent.setup()
    
    render(
      <Question 
        question={mockSingleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={0} 
        totalQuestions={5} 
      />
    )
    
    const firstOption = screen.getByText('50 km/h')
    await user.click(firstOption)
    
    expect(mockOnAnswer).toHaveBeenCalledWith(0)
  })

  test('handles multiple choice question selection and submission', async () => {
    const user = userEvent.setup()
    
    render(
      <Question 
        question={mockMultipleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={1} 
        totalQuestions={5} 
      />
    )
    
    // Select multiple options
    await user.click(screen.getByText('Seatbelt'))
    await user.click(screen.getByText('Driver\'s license'))
    
    // Find and click submit button
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    expect(mockOnAnswer).toHaveBeenCalledWith([0, 1])
  })

  test('shows question counter', () => {
    render(
      <Question 
        question={mockSingleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={2} 
        totalQuestions={10} 
      />
    )
    
    expect(screen.getByText('Question 3 of 10')).toBeInTheDocument()
  })

  test('shows category badge', () => {
    render(
      <Question 
        question={mockSingleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={0} 
        totalQuestions={5} 
      />
    )
    
    expect(screen.getByText('speed')).toBeInTheDocument()
  })

  test('disables submit button when no options selected for multiple choice', () => {
    render(
      <Question 
        question={mockMultipleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={1} 
        totalQuestions={5} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeDisabled()
  })

  test('enables submit button when options are selected for multiple choice', async () => {
    const user = userEvent.setup()
    
    render(
      <Question 
        question={mockMultipleChoiceQuestion} 
        onAnswer={mockOnAnswer} 
        currentIndex={1} 
        totalQuestions={5} 
      />
    )
    
    await user.click(screen.getByText('Seatbelt'))
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).not.toBeDisabled()
  })
})