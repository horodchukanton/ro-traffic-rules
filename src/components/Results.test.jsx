import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Results from './Results';

describe('Results Component', () => {
  const mockRestart = vi.fn();
  const mockGetQuizStatistics = vi.fn();

  beforeEach(() => {
    mockRestart.mockClear();
    mockGetQuizStatistics.mockClear();
  });

  test('renders basic results correctly', () => {
    render(
      <Results
        score={8}
        totalQuestions={10}
        onRestart={mockRestart}
        getQuizStatistics={null}
      />
    );

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Excellent! You passed the quiz.')).toBeInTheDocument();
  });

  test('shows warning message for medium score', () => {
    render(
      <Results
        score={7}
        totalQuestions={10}
        onRestart={mockRestart}
        getQuizStatistics={null}
      />
    );

    expect(screen.getByText('Good job! You can do even better.')).toBeInTheDocument();
  });

  test('shows danger message for low score', () => {
    render(
      <Results
        score={3}
        totalQuestions={10}
        onRestart={mockRestart}
        getQuizStatistics={null}
      />
    );

    expect(screen.getByText('Keep practicing to improve your score.')).toBeInTheDocument();
  });

  test('displays statistics when getQuizStatistics is provided', () => {
    const mockStats = {
      totalQuestions: 10,
      answeredQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      accuracy: 80,
      categoryStats: {},
      missedCategories: [
        { category: 'Speed limits', accuracy: 0.5, missed: 1, total: 2 }
      ],
      wrongAnswerDetails: [
        {
          id: 1,
          category: 'Speed limits',
          text: 'What is the speed limit?',
          correctAnswer: '50 km/h'
        }
      ]
    };

    mockGetQuizStatistics.mockReturnValue(mockStats);

    render(
      <Results
        score={8}
        totalQuestions={10}
        onRestart={mockRestart}
        getQuizStatistics={mockGetQuizStatistics}
      />
    );

    expect(screen.getByText('Quiz Statistics')).toBeInTheDocument();
    expect(screen.getByText('Questions Answered:')).toBeInTheDocument();
    expect(screen.getByText('Accuracy:')).toBeInTheDocument();
    expect(screen.getByText('Wrong Answers:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check that both percentages exist (main score and accuracy)
    const percentages = screen.getAllByText('80%');
    expect(percentages).toHaveLength(2);
  });

  test('toggles detailed statistics when button is clicked', () => {
    const mockStats = {
      totalQuestions: 10,
      answeredQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      accuracy: 80,
      categoryStats: {},
      missedCategories: [
        { category: 'Speed limits', accuracy: 0.5, missed: 1, total: 2 }
      ],
      wrongAnswerDetails: [
        {
          id: 1,
          category: 'Speed limits',
          text: 'What is the speed limit?',
          correctAnswer: '50 km/h'
        }
      ]
    };

    mockGetQuizStatistics.mockReturnValue(mockStats);

    render(
      <Results
        score={8}
        totalQuestions={10}
        onRestart={mockRestart}
        getQuizStatistics={mockGetQuizStatistics}
      />
    );

    const detailsButton = screen.getByText('Show Details');
    expect(detailsButton).toBeInTheDocument();

    // Initially details should not be visible
    expect(screen.queryByText('Areas for Improvement')).not.toBeInTheDocument();

    // Click to show details
    fireEvent.click(detailsButton);
    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
    expect(screen.getByText('Questions You Got Wrong')).toBeInTheDocument();
    expect(screen.getByText('Hide Details')).toBeInTheDocument();

    // Click to hide details
    fireEvent.click(screen.getByText('Hide Details'));
    expect(screen.queryByText('Areas for Improvement')).not.toBeInTheDocument();
  });

  test('calls onRestart when Start Over button is clicked', () => {
    render(
      <Results
        score={8}
        totalQuestions={10}
        onRestart={mockRestart}
        getQuizStatistics={null}
      />
    );

    fireEvent.click(screen.getByText('Start Over'));
    expect(mockRestart).toHaveBeenCalledTimes(1);
  });
});