import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage Component', () => {
  describe('Basic Rendering', () => {
    it('renders error message correctly', () => {
      render(<ErrorMessage message="테스트 오류 메시지" />);
      expect(screen.getByText('테스트 오류 메시지')).toBeInTheDocument();
    });

    it('does not render when message is empty', () => {
      const { container } = render(<ErrorMessage message="" />);
      expect(container.firstChild).toBeNull();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ErrorMessage message="테스트" className="custom-class" />
      );
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('custom-class');
    });

    it('sets custom id when provided', () => {
      render(<ErrorMessage message="테스트" id="custom-id" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('id', 'custom-id');
    });

    it('generates unique id when not provided', () => {
      render(<ErrorMessage message="테스트" />);
      const errorElement = screen.getByRole('alert');
      const id = errorElement.getAttribute('id');
      expect(id).toBeTruthy();
      expect(id).toMatch(/^error-/);
    });
  });

  describe('Error Types', () => {
    it('renders error type correctly', () => {
      const { container } = render(
        <ErrorMessage message="오류" type="error" />
      );
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('error-message-error');
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders warning type correctly', () => {
      const { container } = render(
        <ErrorMessage message="경고" type="warning" />
      );
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('error-message-warning');
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders info type correctly', () => {
      const { container } = render(
        <ErrorMessage message="정보" type="info" />
      );
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('error-message-info');
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('defaults to error type', () => {
      const { container } = render(<ErrorMessage message="기본" />);
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('error-message-error');
    });
  });

  describe('Icons', () => {
    it('shows icon by default', () => {
      render(<ErrorMessage message="아이콘 테스트" />);
      const icon = screen.getByText('⚠');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides icon when showIcon is false', () => {
      render(<ErrorMessage message="아이콘 없음" showIcon={false} />);
      expect(screen.queryByText('⚠')).not.toBeInTheDocument();
    });

    it('shows correct icon for different types', () => {
      const { rerender } = render(
        <ErrorMessage message="오류" type="error" />
      );
      expect(screen.getByText('⚠')).toBeInTheDocument();

      rerender(<ErrorMessage message="경고" type="warning" />);
      expect(screen.getByText('⚠')).toBeInTheDocument();

      rerender(<ErrorMessage message="정보" type="info" />);
      expect(screen.getByText('ℹ')).toBeInTheDocument();
    });
  });

  describe('Layout Types', () => {
    it('renders as block by default', () => {
      const { container } = render(<ErrorMessage message="블록" />);
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('error-message-block');
      expect(errorElement).not.toHaveClass('error-message-inline');
    });

    it('renders as inline when specified', () => {
      const { container } = render(
        <ErrorMessage message="인라인" inline={true} />
      );
      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('error-message-inline');
      expect(errorElement).not.toHaveClass('error-message-block');
    });
  });

  describe('Dismissible Functionality', () => {
    it('does not show dismiss button by default', () => {
      render(<ErrorMessage message="기본" />);
      expect(screen.queryByLabelText('오류 메시지 닫기')).not.toBeInTheDocument();
    });

    it('shows dismiss button when dismissible is true and onDismiss is provided', () => {
      const mockOnDismiss = vi.fn();
      render(
        <ErrorMessage
          message="닫을 수 있음"
          dismissible={true}
          onDismiss={mockOnDismiss}
        />
      );
      expect(screen.getByLabelText('오류 메시지 닫기')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
      const mockOnDismiss = vi.fn();
      render(
        <ErrorMessage
          message="닫기 테스트"
          dismissible={true}
          onDismiss={mockOnDismiss}
        />
      );
      
      const dismissButton = screen.getByLabelText('오류 메시지 닫기');
      fireEvent.click(dismissButton);
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not show dismiss button when dismissible is true but onDismiss is not provided', () => {
      render(<ErrorMessage message="닫기 없음" dismissible={true} />);
      expect(screen.queryByLabelText('오류 메시지 닫기')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role for error type', () => {
      render(<ErrorMessage message="오류" type="error" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has correct ARIA role for warning type', () => {
      render(<ErrorMessage message="경고" type="warning" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has correct ARIA role for info type', () => {
      render(<ErrorMessage message="정보" type="info" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live="polite" attribute', () => {
      render(<ErrorMessage message="라이브 영역" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-atomic="true" attribute', () => {
      render(<ErrorMessage message="원자적 업데이트" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-atomic', 'true');
    });

    it('icon has aria-hidden="true"', () => {
      render(<ErrorMessage message="아이콘 숨김" />);
      const icon = screen.getByText('⚠');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('dismiss button has proper aria-label', () => {
      const mockOnDismiss = vi.fn();
      render(
        <ErrorMessage
          message="접근성 테스트"
          dismissible={true}
          onDismiss={mockOnDismiss}
        />
      );
      
      const dismissButton = screen.getByLabelText('오류 메시지 닫기');
      expect(dismissButton).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('renders message text correctly', () => {
      render(<ErrorMessage message="메시지 내용 테스트" />);
      const messageText = screen.getByText('메시지 내용 테스트');
      expect(messageText).toHaveClass('error-message-text');
    });

    it('has proper content structure', () => {
      const mockOnDismiss = vi.fn();
      render(
        <ErrorMessage
          message="구조 테스트"
          dismissible={true}
          onDismiss={mockOnDismiss}
        />
      );
      
      const content = document.querySelector('.error-message-content');
      expect(content).toBeInTheDocument();
      
      const icon = content?.querySelector('.error-message-icon');
      const text = content?.querySelector('.error-message-text');
      const dismiss = content?.querySelector('.error-message-dismiss');
      
      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
      expect(dismiss).toBeInTheDocument();
    });
  });

  describe('Requirements Verification', () => {
    // Requirement 3.5: 경고 메시지 표시
    it('displays warning message for date validation (Requirement 3.5)', () => {
      render(
        <ErrorMessage
          message="시작일은 종료일보다 이전이어야 합니다."
          type="error"
        />
      );
      
      const errorMessage = screen.getByText('시작일은 종료일보다 이전이어야 합니다.');
      expect(errorMessage).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('provides accessible error messaging (Requirement 3.5)', () => {
      render(
        <ErrorMessage
          message="잘못된 날짜 입력"
          type="error"
          id="date-error"
        />
      );
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('id', 'date-error');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
      expect(errorElement).toHaveAttribute('aria-atomic', 'true');
    });

    it('supports different error types for various validation scenarios (Requirement 3.5)', () => {
      const { rerender } = render(
        <ErrorMessage message="필수 필드 오류" type="error" />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<ErrorMessage message="날짜 형식 경고" type="warning" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<ErrorMessage message="도움말 정보" type="info" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});