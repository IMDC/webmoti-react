import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { render, screen } from '@testing-library/react';

import MediaErrorSnackBar, { getSnackbarContent } from './MediaErrorSnackbar';
import useDevices from '../../../hooks/useDevices/useDevices';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

vi.mock('../../../hooks/useVideoContext/useVideoContext');
vi.mock('../../../hooks/useDevices/useDevices');

const mockUseVideoContext = useVideoContext as vi.Mock<any>;
const mockUseDevices = useDevices as vi.Mock<any>;

describe('the MediaErrorSnackBar', () => {
  beforeEach(() => {
    mockUseVideoContext.mockReturnValue({ isAcquiringLocalTracks: false });
    mockUseDevices.mockReturnValue({ hasAudioInputDevices: true, hasVideoInputDevices: true });
  });

  it('should be closed by default', () => {
    render(<MediaErrorSnackBar />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should open when there is an error', () => {
    render(<MediaErrorSnackBar error={new Error('testError')} />);
    expect(screen.getByTestId('mui-snackbar')).toBeInTheDocument();
  });

  it('should open when there are no audio devices', () => {
    mockUseDevices.mockReturnValue({ hasAudioInputDevices: false, hasVideoInputDevices: true });
    render(<MediaErrorSnackBar />);
    expect(screen.getByTestId('mui-snackbar')).toBeInTheDocument();
  });

  it('should open when there are no video devices', () => {
    mockUseDevices.mockReturnValue({ hasAudioInputDevices: true, hasVideoInputDevices: false });
    render(<MediaErrorSnackBar />);
    expect(screen.getByTestId('mui-snackbar')).toBeInTheDocument();
  });

  it('should not open when there local tracks are being acquired', () => {
    mockUseVideoContext.mockReturnValue({ isAcquiringLocalTracks: true });
    render(<MediaErrorSnackBar error={new Error('testError')} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should close after the handleClose function is called', () => {
    const { rerender } = render(<MediaErrorSnackBar error={new Error('testError')} />);
    expect(screen.getByTestId('mui-snackbar')).toBeInTheDocument();

    // simulate handleClose by rerendering without error
    rerender(<MediaErrorSnackBar />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('the getSnackbarContent function', () => {
  it('return empty strings by default', () => {
    const results = getSnackbarContent(true, true);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "",
        "message": "",
      }
    `);
  });

  it('should return the correct content when there are no audio devices', () => {
    const results = getSnackbarContent(false, true);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "No Microphone Detected:",
        "message": "Other participants in the room will be unable to hear you.",
      }
    `);
  });

  it('should return the correct content when there are no video devices', () => {
    const results = getSnackbarContent(true, false);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "No Camera Detected:",
        "message": "Other participants in the room will be unable to see you.",
      }
    `);
  });

  it('should return the correct content when there are no audio or video devices', () => {
    const results = getSnackbarContent(false, false);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "No Camera or Microphone Detected:",
        "message": "Other participants in the room will be unable to see and hear you.",
      }
    `);
  });

  it('should return the correct content when there is a NotAllowedError', () => {
    const error = new Error();
    error.name = 'NotAllowedError';
    const results = getSnackbarContent(true, true, error);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "Unable to Access Media:",
        "message": "The user has denied permission to use audio and video. Please grant permission to the browser to access the microphone and camera.",
      }
    `);
  });

  it('should return the correct content when there is a NotAllowedError with "Permission denied by syste" message', () => {
    const error = new Error('Permission denied by system');
    error.name = 'NotAllowedError';
    const results = getSnackbarContent(true, true, error);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "Unable to Access Media:",
        "message": "The operating system has blocked the browser from accessing the microphone or camera. Please check your operating system settings.",
      }
    `);
  });

  it('should return the correct content when there is a NotFoundError', () => {
    const error = new Error();
    error.name = 'NotFoundError';
    const results = getSnackbarContent(true, true, error);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "Cannot Find Microphone or Camera:",
        "message": "The browser cannot access the microphone or camera. Please make sure all input devices are connected and enabled.",
      }
    `);
  });

  it('should return the correct content when there is any other kind of error', () => {
    const error = new Error('Any other device errors');
    error.name = 'OtherDeviceError';
    const results = getSnackbarContent(true, true, error);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "Error Acquiring Media:",
        "message": "OtherDeviceError Any other device errors",
      }
    `);
  });

  it('should return the correct content when there is a CameraPermissionsDenied error', () => {
    const error = new Error('CameraPermissionsDenied');
    const results = getSnackbarContent(true, true, error);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "Unable to Access Media:",
        "message": "The user has denied permission to use video. Please grant permission to the browser to access the camera.",
      }
    `);
  });

  it('should return the correct content when there is a MicrophonePermissionsDenied error', () => {
    const error = new Error('MicrophonePermissionsDenied');
    const results = getSnackbarContent(true, true, error);
    expect(results).toMatchInlineSnapshot(`
      {
        "headline": "Unable to Access Media:",
        "message": "The user has denied permission to use audio. Please grant permission to the browser to access the microphone.",
      }
    `);
  });
});
