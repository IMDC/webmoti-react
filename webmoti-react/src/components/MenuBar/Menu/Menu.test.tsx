import { render, fireEvent, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import Menu from './Menu';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useFlipCameraToggle from '../../../hooks/useFlipCameraToggle/useFlipCameraToggle';
import useRoomState from '../../../hooks/useRoomState/useRoomState';
import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

import { useMediaQuery } from '@mui/material';

import { useAppState } from '../../../state';

jest.mock('../../../hooks/useFlipCameraToggle/useFlipCameraToggle');
jest.mock('@material-ui/core/useMediaQuery');
jest.mock('../../../state');
jest.mock('../../../hooks/useVideoContext/useVideoContext', () => () => ({
  localTracks: [],
  room: { sid: 'mockRoomSid' },
}));
jest.mock('../../../hooks/useIsRecording/useIsRecording');
jest.mock('../../../hooks/useChatContext/useChatContext');
jest.mock('../../../hooks/useLocalVideoToggle/useLocalVideoToggle');
jest.mock('../../../hooks/useRoomState/useRoomState');
jest.mock('../../../hooks/useScreenShareParticipant/useScreenShareParticipant');
jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
// silence act warnings by mocking useDevices
jest.mock('../../../hooks/useDevices/useDevices', () => () => ({
  audioInputDevices: [],
  audioOutputDevices: [],
  videoInputDevices: [],
  hasAudioInputDevices: true,
  hasVideoInputDevices: true,
}));

const mockUseFlipCameraToggle = useFlipCameraToggle as jest.Mock<any>;
const mockUseMediaQuery = useMediaQuery as jest.Mock<boolean>;
const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseChatContext = useChatContext as jest.Mock<any>;
const mockUseRoomState = useRoomState as jest.Mock<any>;
const mockUseScreenShareParticipant = useScreenShareParticipant as jest.Mock<any>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;

const mockToggleChatWindow = jest.fn();
const mockSetIsGalleryViewActive = jest.fn();

beforeAll(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      addEventListener: jest.fn(),
      getUserMedia: jest.fn(),
      enumerateDevices: jest.fn().mockResolvedValue([
        { kind: 'audioinput', deviceId: 'audio-1', label: 'Mic' },
        { kind: 'videoinput', deviceId: 'video-1', label: 'Camera' },
        { kind: 'audiooutput', deviceId: 'output-1', label: 'Speaker' },
      ]),
      removeEventListener: jest.fn(),
    },
  });

  mockUseFlipCameraToggle.mockImplementation(() => ({
    flipCameraDisabled: false,
    flipCameraSupported: false,
  }));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseChatContext.mockImplementation(() => ({ setIsChatWindowOpen: mockToggleChatWindow }));
  mockUseRoomState.mockImplementation(() => 'connected');
  mockUseScreenShareParticipant.mockImplementation(() => 'mockParticipant');
  mockUseWebmotiVideoContext.mockImplementation(() => ({}));
});

describe('Menu component', () => {
  describe('on desktop devices', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockImplementation(() => false);
      mockUseAppState.mockImplementation(() => ({
        isFetching: false,
        updateRecordingRules: jest.fn(),
        roomType: 'group',
        setIsGalleryViewActive: mockSetIsGalleryViewActive,
        isGalleryViewActive: false,
      }));
    });

    it('should open the Menu when the Button is clicked', () => {
      render(<Menu />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /more/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should open the AboutDialog when About button is clicked', () => {
      render(<Menu />);
      fireEvent.click(screen.getByRole('button', { name: /more/i }));
      fireEvent.click(screen.getByText('About'));
      expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
    });

    it('should open the DeviceSelectionDialog when Settings is clicked', () => {
      render(<Menu />);
      fireEvent.click(screen.getByRole('button', { name: /more/i }));
      fireEvent.click(screen.getByText('Audio and Video Settings'));
      expect(screen.getByRole('heading', { name: /audio and video settings/i })).toBeInTheDocument();
    });

    it('should toggle to Gallery View when inactive', () => {
      render(<Menu />);
      fireEvent.click(screen.getByRole('button', { name: /more/i }));
      fireEvent.click(screen.getByText('Gallery View'));
      expect(mockSetIsGalleryViewActive.mock.calls[0][0](false)).toBe(true);
    });

    it('should toggle to Speaker View when active', () => {
      mockUseAppState.mockImplementation(() => ({
        setIsGalleryViewActive: mockSetIsGalleryViewActive,
        isGalleryViewActive: true,
      }));
      render(<Menu />);
      fireEvent.click(screen.getByRole('button', { name: /more/i }));
      fireEvent.click(screen.getByText('Speaker View'));
      expect(mockSetIsGalleryViewActive.mock.calls[0][0](true)).toBe(false);
    });

    it('should not render the Flip Camera button', () => {
      render(<Menu />);
      fireEvent.click(screen.getByRole('button', { name: /more/i }));
      expect(screen.queryByText('Flip Camera')).toBeNull();
    });
  });

  describe('on mobile devices', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockImplementation(() => true);
      mockUseAppState.mockImplementation(() => ({
        setIsGalleryViewActive: mockSetIsGalleryViewActive,
        isGalleryViewActive: false,
      }));
    });

    it('should render Flip Camera when supported', () => {
      mockUseFlipCameraToggle.mockImplementation(() => ({
        flipCameraSupported: true,
        flipCameraDisabled: false,
        toggleFacingMode: jest.fn(),
      }));

      render(<Menu />);
      fireEvent.click(screen.getByLabelText('More options'));
      expect(screen.getByText('Flip Camera')).toBeInTheDocument();
      expect(screen.getByText('Flip Camera').closest('li')).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable Flip Camera when flipCameraDisabled is true', () => {
      mockUseFlipCameraToggle.mockImplementation(() => ({
        flipCameraSupported: true,
        flipCameraDisabled: true,
        toggleFacingMode: jest.fn(),
      }));

      render(<Menu />);
      fireEvent.click(screen.getByLabelText('More options'));
      expect(screen.getByText('Flip Camera').closest('li')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not show Flip Camera when unsupported', () => {
      mockUseFlipCameraToggle.mockImplementation(() => ({
        flipCameraSupported: false,
        flipCameraDisabled: false,
        toggleFacingMode: jest.fn(),
      }));

      render(<Menu />);
      fireEvent.click(screen.getByLabelText('More options'));
      expect(screen.queryByText('Flip Camera')).toBeNull();
    });
  });
});
