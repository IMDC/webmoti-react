import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDialog from './ErrorDialog';
import { TwilioError } from 'twilio-video';

describe('the ErrorDialog component', () => {
  const message = 'Fake Error message';
  const code = 45345;

  it('should be closed if no error is passed', () => {
    render(<ErrorDialog dismissError={() => {}} error={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should be open if an error is passed', () => {
    const error = {} as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display error message but not error code if code is missing', () => {
    const error = { message } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByText(/error code/i)).not.toBeInTheDocument();
  });

  it('should display error message and error code when both are given', () => {
    const error = { message, code } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText(`Error Code: ${code}`)).toBeInTheDocument();
  });

  it('should display enhanced message when error code is 20101', () => {
    const error = { message, code: 20101 } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(screen.getByText(`${message}. Please make sure you are using the correct credentials.`)).toBeInTheDocument();
    expect(screen.getByText(/20101/)).toBeInTheDocument();
  });

  it('should display enhanced message for "Permission denied by system"', () => {
    const error = { message: 'Permission denied by system', code: 0 } as TwilioError;
    render(<ErrorDialog dismissError={() => {}} error={error} />);
    expect(
      screen.getByText(
        /Unable to share your screen. Please make sure that your operating system has the correct permissions enabled/i
      )
    ).toBeInTheDocument();
  });

  it('should invoke dismissError when user clicks OK', () => {
    const dismissError = jest.fn();
    const error = { message, code } as TwilioError;
    render(<ErrorDialog dismissError={dismissError} error={error} />);
    fireEvent.click(screen.getByRole('button', { name: /ok/i }));
    expect(dismissError).toHaveBeenCalled();
  });
});
