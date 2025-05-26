import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import Snackbar from './Snackbar';

describe('the Snackbar component', () => {
  it('should render correctly with "warning" variant', () => {
    render(
      <Snackbar variant="warning" headline="Test Headline" message="Test Message" handleClose={() => {}} open={true} />
    );
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should render correctly with "error" variant', () => {
    render(
      <Snackbar variant="error" headline="Test Headline" message="Test Message" handleClose={() => {}} open={true} />
    );
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should render correctly with "info" variant', () => {
    render(
      <Snackbar variant="info" headline="Test Headline" message="Test Message" handleClose={() => {}} open={true} />
    );
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should render correctly with no handleClose function provided', () => {
    render(<Snackbar variant="error" headline="Test Headline" message="Test Message" open={true} />);
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
  });

  describe('the handleClose function', () => {
    it('should be called when close button is clicked', () => {
      const mockHandleClose = vi.fn();

      render(
        <Snackbar
          variant="warning"
          headline="Test Headline"
          message="Test Message"
          handleClose={mockHandleClose}
          open={true}
        />
      );

      fireEvent.click(screen.getByLabelText(/close/i));
      expect(mockHandleClose).toHaveBeenCalled();
    });

    it('should call handleClose when close icon is clicked', () => {
      const mockHandleClose = vi.fn();

      render(
        <Snackbar
          variant="warning"
          headline="Test Headline"
          message="Test Message"
          handleClose={mockHandleClose}
          open={true}
        />
      );

      fireEvent.click(screen.getByLabelText(/close/i));
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });
});
