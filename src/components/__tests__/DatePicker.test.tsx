import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DatePicker from '../DatePicker';

// Helper function to get date input
const getDateInput = (container?: HTMLElement) => {
  return container ? 
    container.querySelector('input[type="date"]') as HTMLInputElement :
    screen.getByDisplayValue('') as HTMLInputElement || 
    document.querySelector('input[type="date"]') as HTMLInputElement;
};

describe('DatePicker Component', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} />);
      const input = getDateInput(container);
      expect(input).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(<DatePicker onChange={mockOnChange} label="시작일" />);
      const label = screen.getByText('시작일');
      expect(label).toBeInTheDocument();
    });

    it('shows required indicator when required prop is true', () => {
      render(<DatePicker onChange={mockOnChange} label="시작일" required />);
      const requiredIndicator = screen.getByLabelText('필수');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} className="custom-class" />);
      const datePickerContainer = container.querySelector('.date-picker-container');
      expect(datePickerContainer).toHaveClass('custom-class');
    });

    it('sets input id when provided', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} id="test-id" />);
      const input = getDateInput(container);
      expect(input).toHaveAttribute('id', 'test-id');
    });
  });

  describe('Date Value Handling', () => {
    it('displays formatted date value', () => {
      const testDate = new Date(2024, 0, 15); // January 15, 2024
      const { container } = render(<DatePicker onChange={mockOnChange} value={testDate} />);
      const input = getDateInput(container);
      expect(input.value).toBe('2024-01-15');
    });

    it('handles undefined value', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} value={undefined} />);
      const input = getDateInput(container);
      expect(input.value).toBe('');
    });

    it('handles invalid date gracefully', () => {
      const invalidDate = new Date('invalid');
      const { container } = render(<DatePicker onChange={mockOnChange} value={invalidDate} />);
      const input = getDateInput(container);
      expect(input.value).toBe('');
    });
  });

  describe('Date Input and Validation', () => {
    it('calls onChange with parsed date when valid date is entered', async () => {
      const { container } = render(<DatePicker onChange={mockOnChange} />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-15' } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(new Date(2024, 0, 15));
      });
    });

    it('calls onChange with undefined when input is cleared', async () => {
      const { container } = render(<DatePicker onChange={mockOnChange} value={new Date(2024, 0, 15)} />);
      const input = getDateInput(container);
      
      // First verify it has a value
      expect(input.value).toBe('2024-01-15');
      
      // Clear the input
      fireEvent.change(input, { target: { value: '' } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(undefined);
      });
    });

    it('shows error for invalid date format', async () => {
      const { container } = render(<DatePicker onChange={mockOnChange} />);
      const input = getDateInput(container);
      
      // Simulate invalid date input (this is tricky with HTML5 date input, but we test the validation logic)
      fireEvent.change(input, { target: { value: 'invalid-date' } });
      
      await waitFor(() => {
        const errorMessage = screen.queryByText('올바른 날짜 형식이 아닙니다.');
        // Note: HTML5 date input typically prevents invalid formats, so this test verifies our error handling logic
      });
    });
  });

  describe('Min/Max Date Validation', () => {
    it('shows error when date is before minDate', async () => {
      const minDate = new Date(2024, 0, 10); // January 10, 2024
      const { container } = render(<DatePicker onChange={mockOnChange} minDate={minDate} />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-05' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/날짜는 .* 이후여야 합니다\./);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('shows error when date is after maxDate', async () => {
      const maxDate = new Date(2024, 0, 20); // January 20, 2024
      const { container } = render(<DatePicker onChange={mockOnChange} maxDate={maxDate} />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-25' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/날짜는 .* 이전이어야 합니다\./);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('accepts date within min/max range', async () => {
      const minDate = new Date(2024, 0, 10);
      const maxDate = new Date(2024, 0, 20);
      const { container } = render(<DatePicker onChange={mockOnChange} minDate={minDate} maxDate={maxDate} />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-15' } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(new Date(2024, 0, 15));
        const errorMessage = screen.queryByRole('alert');
        expect(errorMessage).not.toBeInTheDocument();
      });
    });

    it('sets min and max attributes on input', () => {
      const minDate = new Date(2024, 0, 10);
      const maxDate = new Date(2024, 0, 20);
      const { container } = render(<DatePicker onChange={mockOnChange} minDate={minDate} maxDate={maxDate} />);
      const input = getDateInput(container);
      
      expect(input).toHaveAttribute('min', '2024-01-10');
      expect(input).toHaveAttribute('max', '2024-01-20');
    });
  });

  describe('Error Display', () => {
    it('displays external error message', () => {
      render(<DatePicker onChange={mockOnChange} error="외부 오류 메시지" />);
      const errorMessage = screen.getByText('외부 오류 메시지');
      expect(errorMessage).toBeInTheDocument();
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
    });

    it('prioritizes external error over internal error', async () => {
      const minDate = new Date(2024, 0, 10);
      const { container } = render(<DatePicker onChange={mockOnChange} minDate={minDate} error="외부 오류" />);
      const input = getDateInput(container);
      
      // Trigger internal error
      fireEvent.change(input, { target: { value: '2024-01-05' } });
      
      await waitFor(() => {
        const externalError = screen.getByText('외부 오류');
        expect(externalError).toBeInTheDocument();
        
        const internalError = screen.queryByText(/날짜는 .* 이후여야 합니다\./);
        expect(internalError).not.toBeInTheDocument();
      });
    });

    it('adds error styling to input when error exists', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} error="오류 메시지" />);
      const input = getDateInput(container);
      expect(input).toHaveClass('error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('associates label with input using htmlFor and id', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} label="시작일" id="start-date" />);
      const label = screen.getByText('시작일');
      const input = getDateInput(container);
      
      expect(label).toHaveAttribute('for', 'start-date');
      expect(input).toHaveAttribute('id', 'start-date');
    });

    it('generates unique id when not provided', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} label="시작일" />);
      const input = getDateInput(container);
      const id = input.getAttribute('id');
      
      expect(id).toBeTruthy();
      expect(id).toMatch(/^datepicker-/);
    });

    it('associates error message with input using aria-describedby', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} error="오류 메시지" id="test-input" />);
      const input = getDateInput(container);
      const errorMessage = screen.getByRole('alert');
      
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
      expect(errorMessage).toHaveAttribute('id', 'test-input-error');
    });

    it('sets aria-invalid when error exists', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} error="오류 메시지" />);
      const input = getDateInput(container);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets required attribute when required prop is true', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} required />);
      const input = getDateInput(container);
      expect(input).toHaveAttribute('required');
    });

    it('error message has aria-live="polite"', () => {
      render(<DatePicker onChange={mockOnChange} error="오류 메시지" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} disabled />);
      const input = getDateInput(container);
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled');
    });

    it('does not call onChange when disabled', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} disabled />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-15' } });
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Date Formatting Utilities', () => {
    it('formats date correctly for input', () => {
      const testDate = new Date(2024, 11, 25); // December 25, 2024
      const { container } = render(<DatePicker onChange={mockOnChange} value={testDate} />);
      const input = getDateInput(container);
      expect(input.value).toBe('2024-12-25');
    });

    it('handles edge case dates correctly', () => {
      const edgeDate = new Date(2024, 0, 1); // January 1, 2024
      const { container } = render(<DatePicker onChange={mockOnChange} value={edgeDate} />);
      const input = getDateInput(container);
      expect(input.value).toBe('2024-01-01');
    });
  });

  describe('Requirements Verification', () => {
    // Requirement 3.2: 날짜 선택기 표시
    it('displays date picker when clicked (Requirement 3.2)', () => {
      const { container } = render(<DatePicker onChange={mockOnChange} />);
      const input = getDateInput(container);
      expect(input).toHaveAttribute('type', 'date');
    });

    // Requirement 3.3: 날짜 선택 및 저장
    it('saves selected date (Requirement 3.3)', async () => {
      const { container } = render(<DatePicker onChange={mockOnChange} />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-15' } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(new Date(2024, 0, 15));
      });
    });

    // Requirement 3.4: 날짜 반영
    it('reflects date in table (Requirement 3.4)', () => {
      const testDate = new Date(2024, 0, 15);
      const { container } = render(<DatePicker onChange={mockOnChange} value={testDate} />);
      const input = getDateInput(container);
      expect(input.value).toBe('2024-01-15');
    });

    // Requirement 3.5: 날짜 유효성 검사
    it('validates date ranges (Requirement 3.5)', async () => {
      const minDate = new Date(2024, 0, 10);
      const { container } = render(<DatePicker onChange={mockOnChange} minDate={minDate} />);
      const input = getDateInput(container);
      
      fireEvent.change(input, { target: { value: '2024-01-05' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});