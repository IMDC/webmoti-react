import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { render, screen, act } from '@testing-library/react';
import RecordingNotifications from './RecordingNotifications';
import useIsRecording from '../../hooks/useIsRecording/useIsRecording';

vi.mock('../../hooks/useIsRecording/useIsRecording');
const mockUseIsRecording = useIsRecording as vi.Mock<boolean | null>;

describe('the RecordingNotifications component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsRecording.mockImplementation(() => null);
  });

  it('should not display a notification when recording is not in progress', () => {
    render(<RecordingNotifications />);
    expect(screen.queryByText(/recording/i)).not.toBeInTheDocument();
  });

  it('should display "Recording is in progress." when recording is active on join', () => {
    mockUseIsRecording.mockImplementation(() => true);
    render(<RecordingNotifications />);
    expect(screen.getByText('Recording is in progress.')).toBeInTheDocument();
  });

  it('should display "Recording has started." when recording starts after join', () => {
    let isRecording = false;
    mockUseIsRecording.mockImplementation(() => isRecording);

    const { rerender } = render(<RecordingNotifications />);

    act(() => {
      isRecording = true;
      mockUseIsRecording.mockImplementation(() => isRecording);
      rerender(<RecordingNotifications />);
    });

    expect(screen.getByText('Recording has started.')).toBeInTheDocument();
  });

  it('should display "Recording Complete" when recording stops after being active', () => {
    let isRecording = true;
    mockUseIsRecording.mockImplementation(() => isRecording);

    const { rerender } = render(<RecordingNotifications />);

    act(() => {
      isRecording = false;
      mockUseIsRecording.mockImplementation(() => isRecording);
      rerender(<RecordingNotifications />);
    });

    expect(screen.getByText('Recording Complete')).toBeInTheDocument();
    expect(screen.getByText(/Twilio Console/)).toBeInTheDocument();
  });
});
