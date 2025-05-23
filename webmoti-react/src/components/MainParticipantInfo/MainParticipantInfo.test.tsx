import { render, screen } from '@testing-library/react';

import MainParticipantInfo from './MainParticipantInfo';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';
import useIsRecording from '../../hooks/useIsRecording/useIsRecording';
import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import usePublications from '../../hooks/usePublications/usePublications';
import useTrack from '../../hooks/useTrack/useTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

jest.mock('../../hooks/useParticipantNetworkQualityLevel/useParticipantNetworkQualityLevel', () => () => 4);
jest.mock('../../hooks/usePublications/usePublications');
jest.mock('../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff');
jest.mock('../../hooks/useTrack/useTrack');
jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting');
jest.mock('../../hooks/useIsRecording/useIsRecording');
jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUsePublications = usePublications as jest.Mock<any>;
const mockUseIsTrackSwitchedOff = useIsTrackSwitchedOff as jest.Mock<any>;
const mockUseTrack = useTrack as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;
const mockUseParticipantIsReconnecting = useParticipantIsReconnecting as jest.Mock<boolean>;
const mockUseIsRecording = useIsRecording as jest.Mock<boolean>;

const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

const mockLocalParticipant = createMockParticipant('mockIdentity', 0);
const mockRemoteParticipant = createMockParticipant('remoteIdentity', 1);

describe('MainParticipantInfo component', () => {
  beforeEach(jest.clearAllMocks);

  beforeEach(() => {
    mockUseVideoContext.mockImplementation(() => ({
      room: createMockRoom('mockroom', mockLocalParticipant),
    }));
    mockUsePublications.mockImplementation(() => [{ trackName: '', kind: 'video' }]);
    mockUseTrack.mockImplementation((track: any) => track);
    mockUseIsTrackSwitchedOff.mockImplementation(() => false);
  });

  it('should render AvatarIcon when no video tracks are published', () => {
    mockUsePublications.mockImplementationOnce(() => []);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument();
  });

  it('should not render AvatarIcon when video tracks are published', () => {
    mockUsePublications.mockImplementationOnce(() => [{ trackName: '', kind: 'video' }]);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.queryByTestId('avatar-icon')).not.toBeInTheDocument();
  });

  it('should not render AvatarIcon when screen share is active', () => {
    mockUsePublications.mockImplementationOnce(() => [{ trackName: 'screen-123456' }]);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.queryByTestId('avatar-icon')).not.toBeInTheDocument();
  });

  it('should render AvatarIcon when video is switched off', () => {
    mockUseIsTrackSwitchedOff.mockImplementationOnce(() => true);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument();
  });

  it('should not render reconnecting UI when connected', () => {
    mockUseParticipantIsReconnecting.mockImplementationOnce(() => false);
    mockUsePublications.mockImplementation(() => [{ trackName: '', kind: 'video' }]);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.queryByTestId('reconnecting-overlay')).not.toBeInTheDocument();
  });

  it('should render reconnecting UI when reconnecting', () => {
    mockUseParticipantIsReconnecting.mockImplementationOnce(() => true);
    mockUsePublications.mockImplementation(() => [{ trackName: '', kind: 'video' }]);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('reconnecting-overlay')).toBeInTheDocument();
  });

  it('should use screen share track if available', () => {
    mockUsePublications.mockImplementationOnce(() => [{ trackName: 'screen' }, { trackName: '', kind: 'video' }]);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(mockUseTrack).toHaveBeenCalledWith({ trackName: 'screen' });
  });

  it('should use camera track if screen share is not available', () => {
    mockUsePublications.mockImplementationOnce(() => [{ trackName: '', kind: 'video' }]);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(mockUseTrack).toHaveBeenCalledWith({ trackName: '', kind: 'video' });
  });

  it('should show identity with "(You)" when local participant', () => {
    const mockParticipant = mockLocalParticipant;
    mockUseVideoContext.mockImplementationOnce(() => ({ room: { localParticipant: mockParticipant } }));
    render(<MainParticipantInfo participant={mockParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('participant-identity')).toHaveTextContent('mockIdentity (You)');
  });

  it('should show identity without "(You)" when not local participant', () => {
    render(<MainParticipantInfo participant={mockRemoteParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('participant-identity')).toHaveTextContent(/^remoteIdentity$/);
  });

  it('should append "- Screen" when screen sharing', () => {
    mockUsePublications.mockImplementationOnce(() => [
      { trackName: 'screen', kind: 'video' },
      { trackName: '', kind: 'video' },
    ]);
    render(<MainParticipantInfo participant={mockRemoteParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('participant-identity')).toHaveTextContent('remoteIdentity - Screen');
  });

  it('should not show recording indicator when not recording', () => {
    mockUseIsRecording.mockImplementationOnce(() => false);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.queryByTestId('recording-indicator')).not.toBeInTheDocument();
  });

  it('should show recording indicator when recording', () => {
    mockUseIsRecording.mockImplementationOnce(() => true);
    render(<MainParticipantInfo participant={mockLocalParticipant}>mock children</MainParticipantInfo>);
    expect(screen.getByTestId('recording-indicator')).toBeInTheDocument();
  });
});
