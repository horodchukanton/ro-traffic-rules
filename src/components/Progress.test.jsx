import React from 'react';
import { render, screen } from '@testing-library/react';
import Progress from './Progress';

describe('Progress Component', () => {
  test('displays current progress correctly', () => {
    const mockAnswers = {
      1: 0,
      2: 1,
      3: 0
    };

    render(
      <Progress
        currentQuestion={4}
        totalQuestions={10}
        score={7}
        answers={mockAnswers}
      />
    );

    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('5 / 10')).toBeInTheDocument(); // currentQuestion + 1
    expect(screen.getByText('3')).toBeInTheDocument(); // answered questions
    expect(screen.getByText('7')).toBeInTheDocument(); // score
  });

  test('shows correct progress percentage', () => {
    render(
      <Progress
        currentQuestion={4}
        totalQuestions={10}
        score={3}
        answers={{}}
      />
    );

    // Progress should be (4+1)/10 * 100 = 50%
    const progressFill = document.querySelector('[style*="width: 50%"]');
    expect(progressFill).toBeInTheDocument();
  });

  test('handles empty answers object', () => {
    render(
      <Progress
        currentQuestion={0}
        totalQuestions={5}
        score={0}
        answers={null}
      />
    );

    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    // Use more specific selectors for multiple "0" values
    const statValues = screen.getAllByText('0');
    expect(statValues).toHaveLength(2); // Should have 2 zeros: answered and score
  });

  test('handles zero total questions', () => {
    render(
      <Progress
        currentQuestion={0}
        totalQuestions={0}
        score={0}
        answers={{}}
      />
    );

    expect(screen.getByText('1 / 0')).toBeInTheDocument();
    
    // Progress percentage should be 0% when totalQuestions is 0
    const progressFill = document.querySelector('[style*="width: 0%"]');
    expect(progressFill).toBeInTheDocument();
  });
});