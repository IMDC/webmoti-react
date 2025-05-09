import { render, screen } from '@testing-library/react';
import ParticipantInfo from './ParticipantInfo';
import { createMockPublication } from '../../__mocks__/mockCreator';
import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import usePublications from '../../hooks/usePublications/usePublications';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { useAppState } from '../../state';

jest.mock('../../state');
jest.mock('../../hooks/useParticipantNetworkQualityLevel/useParticipantNetworkQualityLevel', () => () => 4);
jest.mock('../../hooks/usePublications/usePublications');
jest.mock('../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff');
jest.mock('../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting');
jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseAppState = useAppState as jest.Mock<any>;
const mockUsePublications = usePublications as jest.Mock<any>;
const mockUseIsTrackSwitchedOff = useIsTrackSwitchedOff as jest.Mock<any>;
const mockUseParticipantIsReconnecting = useParticipantIsReconnecting as jest.Mock<boolean>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;

mockUseWebmotiVideoContext.mockImplementation(() => ({
  isCameraOneOff: () => false,
  isCameraTwoOff: () => false,
}));
mockUseAppState.mockImplementation(() => ({ isGalleryViewActive: false }));

const mockVideoPublication = createMockPublication('video');
const mockScreenSharePublication = createMockPublication('video', 'screen');

describe('the ParticipantInfo component', () => {
  it('should render the AvatarIcon component when no video tracks are published', () => {
    mockUsePublications.mockImplementation(() => []);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument();
  });

  it('should not display the AvatarIcon component when a video track is published', () => {
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.queryByTestId('avatar-icon')).not.toBeInTheDocument();
  });

  it('should render the AvatarIcon component when the video track is switchedOff', () => {
    mockUseIsTrackSwitchedOff.mockImplementation(() => true);
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.getByTestId('avatar-icon')).toBeInTheDocument();
  });

  it('should not render the reconnecting UI when the user is connected', () => {
    mockUseParticipantIsReconnecting.mockImplementationOnce(() => false);
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.queryByText('Reconnecting...')).not.toBeInTheDocument();
  });

  it('should render the reconnecting UI when the user is reconnecting', () => {
    mockUseParticipantIsReconnecting.mockImplementationOnce(() => true);
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('should add hideParticipant class to container component when hideParticipant prop is true', () => {
    render(
      <ParticipantInfo
        onClick={() => {}}
        isSelected={false}
        participant={{ identity: 'mockIdentity' } as any}
        hideParticipant={true}
      >
        mock children
      </ParticipantInfo>
    );
    const container = screen.getByTestId('participant-mockIdentity');
    expect(container.className).toMatch(/hideParticipant/);
  });

  it('should not add hideParticipant class to container component when hideParticipant prop is false', () => {
    render(
      <ParticipantInfo
        onClick={() => {}}
        isSelected={false}
        participant={{ identity: 'mockIdentity' } as any}
        hideParticipant={false}
      >
        mock children
      </ParticipantInfo>
    );
    const container = screen.getByTestId('participant-mockIdentity');
    expect(container.className).not.toMatch(/hideParticipant/);
  });

  it('should add cursorPointer class to container component when onClick prop is present', () => {
    render(
      <ParticipantInfo isSelected={false} participant={{ identity: 'mockIdentity' } as any} onClick={() => {}}>
        mock children
      </ParticipantInfo>
    );
    const container = screen.getByTestId('participant-mockIdentity');
    expect(container.className).toMatch(/cursorPointer/);
  });

  it('should not add cursorPointer class to container component when onClick prop is not present', () => {
    render(
      <ParticipantInfo isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    const container = screen.getByTestId('participant-mockIdentity');
    expect(container.className).not.toMatch(/cursorPointer/);
  });

  it('should render the PinIcon component when the participant is selected', () => {
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={true} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.getByTestId('pin-icon')).toBeInTheDocument();
  });

  it('should not render the PinIcon component when the participant is not selected', () => {
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.queryByTestId('pin-icon')).not.toBeInTheDocument();
  });

  it('should render the ScreenShareIcon component when the participant is sharing their screen', () => {
    mockUsePublications.mockImplementation(() => [mockScreenSharePublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.getByTestId('screen-share-icon')).toBeInTheDocument();
  });

  it('should not render the ScreenShareIcon component when the participant is not sharing their screen', () => {
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.queryByTestId('screen-share-icon')).not.toBeInTheDocument();
  });

  it('should add "(You)" to the participants identity when they are the localParticipant', () => {
    mockUseIsTrackSwitchedOff.mockImplementation(() => false);
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo
        onClick={() => {}}
        isSelected={false}
        participant={{ identity: 'mockIdentity' } as any}
        isLocalParticipant
      >
        mock children
      </ParticipantInfo>
    );
    expect(screen.getByText('mockIdentity (You)')).toBeInTheDocument();
  });

  it('should not add "(You)" to the participants identity when they are not the localParticipant', () => {
    mockUseIsTrackSwitchedOff.mockImplementation(() => false);
    mockUsePublications.mockImplementation(() => [mockVideoPublication]);
    render(
      <ParticipantInfo onClick={() => {}} isSelected={false} participant={{ identity: 'mockIdentity' } as any}>
        mock children
      </ParticipantInfo>
    );
    expect(screen.queryByText('mockIdentity (You)')).not.toBeInTheDocument();
  });
});