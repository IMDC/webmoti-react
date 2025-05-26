import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeviceSelectionScreen from './DeviceSelectionScreen';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import { clientEnv } from '../../../clientEnv';

jest.mock('../../../hooks/useChatContext/useChatContext', () => () => ({ connect: mockChatConnect }));
jest.mock('../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../state');

const mockConnect = jest.fn();
const mockChatConnect = jest.fn(() => Promise.resolve());
const mockGetToken = jest.fn(() => Promise.resolve({ token: 'mockToken' }));

const mockUseVideoContext = useVideoContext as jest.Mock;
const mockUseAppState = useAppState as jest.Mock;

jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

describe('the DeviceSelectionScreen component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (clientEnv.DISABLE_TWILIO_CONVERSATIONS as jest.Mock).mockReturnValue('false');
    mockUseAppState.mockImplementation(() => ({
      getToken: mockGetToken,
      isFetching: false,
      settings: { dominantSpeakerPriority: 'standard' },
    }));
    mockUseVideoContext.mockImplementation(() => ({
      connect: mockConnect,
      isAcquiringLocalTracks: false,
      isConnecting: false,
      localTracks: [],
    }));
  });

  describe('when connecting to a room', () => {
    beforeEach(() => {
      mockUseVideoContext.mockImplementationOnce(() => ({
        connect: mockConnect,
        isAcquiringLocalTracks: false,
        isConnecting: true,
        localTracks: [],
      }));
    });

    it('should show the loading screen', () => {
      render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show only the loading screen with no buttons', () => {
      render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('when acquiring local tracks', () => {
    beforeEach(() => {
      mockUseVideoContext.mockImplementationOnce(() => ({
        connect: mockConnect,
        isAcquiringLocalTracks: true,
        isConnecting: false,
        localTracks: [],
      }));
    });

    it('should disable Join Now, toggle video, and toggle audio buttons', () => {
      render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
      expect(screen.getByRole('button', { name: /join now/i })).toBeDisabled();
    });
  });

  describe('when fetching a token', () => {
    beforeEach(() => {
      mockUseAppState.mockImplementationOnce(() => ({ getToken: mockGetToken, isFetching: true }));
      mockUseVideoContext.mockImplementationOnce(() => ({
        connect: mockConnect,
        isAcquiringLocalTracks: false,
        isConnecting: false,
        localTracks: [],
      }));
    });

    it('should show the loading screen', () => {
      render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show only the loading screen with no buttons', () => {
      render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('should not disable the Join Now button by default', () => {
    render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    expect(screen.getByRole('button', { name: /join now/i })).toBeEnabled();
  });

  it('should fetch token and connect to video + chat on Join Now click', async () => {
    render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /join now/i }));

    await waitFor(() => {
      expect(mockGetToken).toHaveBeenCalledWith('test name', 'test room name');
      expect(mockConnect).toHaveBeenCalledWith('mockToken');
      expect(mockChatConnect).toHaveBeenCalledWith('mockToken');
    });
  });

  it('should only connect to video if chat is disabled', async () => {
    (clientEnv.DISABLE_TWILIO_CONVERSATIONS as jest.Mock).mockReturnValue('true');
    render(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /join now/i }));

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledWith('mockToken');
      expect(mockChatConnect).not.toHaveBeenCalled();
    });
  });
});
