import { render, screen } from '@testing-library/react';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import MainParticipant from './MainParticipant';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';

jest.mock('../../hooks/useMainParticipant/useMainParticipant');
jest.mock('../VideoProvider/useSelectedParticipant/useSelectedParticipant');
jest.mock('../../hooks/useScreenShareParticipant/useScreenShareParticipant');
jest.mock('../../hooks/useVideoContext/useVideoContext');

jest.mock('../ParticipantTracks/ParticipantTracks', () => (props: any) => (
  <div
    data-testid="participant-tracks"
    data-video-priority={props.videoPriority}
    data-is-local={String(props.isLocalParticipant)}
    data-enable-screen-share={String(props.enableScreenShare)}
  />
));

jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

const mockUseMainParticipant = useMainParticipant as jest.Mock;
const mockUseSelectedParticipant = useSelectedParticipant as jest.Mock;
const mockUseScreenShareParticipant = useScreenShareParticipant as jest.Mock;
const mockUseVideoContext = useVideoContext as jest.Mock;

describe('MainParticipant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets videoPriority to high when mainParticipant is selected', () => {
    const participant = createMockParticipant('A');

    mockUseMainParticipant.mockReturnValue(participant);
    mockUseSelectedParticipant.mockReturnValue([participant]);
    mockUseScreenShareParticipant.mockReturnValue({});
    mockUseVideoContext.mockReturnValue({ room: createMockRoom() });

    render(<MainParticipant />);

    const el = screen.getByTestId('participant-tracks');
    expect(el).toHaveAttribute('data-video-priority', 'high');
  });

  it('sets videoPriority to high when mainParticipant is screenShareParticipant', () => {
    const participant = createMockParticipant('B');

    mockUseMainParticipant.mockReturnValue(participant);
    mockUseSelectedParticipant.mockReturnValue([{}]);
    mockUseScreenShareParticipant.mockReturnValue(participant);
    mockUseVideoContext.mockReturnValue({ room: createMockRoom() });

    render(<MainParticipant />);

    const el = screen.getByTestId('participant-tracks');
    expect(el).toHaveAttribute('data-video-priority', 'high');
  });

  it('sets videoPriority to null when mainParticipant is localParticipant', () => {
    const participant = createMockParticipant('C');

    mockUseMainParticipant.mockReturnValue(participant);
    mockUseSelectedParticipant.mockReturnValue([{}]);
    mockUseScreenShareParticipant.mockReturnValue({});
    mockUseVideoContext.mockReturnValue({ room: createMockRoom('mockroom', participant) });

    render(<MainParticipant />);

    const el = screen.getByTestId('participant-tracks');
    expect(el).not.toHaveAttribute('data-video-priority');
  });

  it('sets enableScreenShare to false when mainParticipant is localParticipant', () => {
    const participant = createMockParticipant('D');

    mockUseMainParticipant.mockReturnValue(participant);
    mockUseSelectedParticipant.mockReturnValue([{}]);
    mockUseScreenShareParticipant.mockReturnValue({});
    mockUseVideoContext.mockReturnValue({ room: createMockRoom('mockroom', participant) });

    render(<MainParticipant />);

    const el = screen.getByTestId('participant-tracks');
    expect(el).toHaveAttribute('data-enable-screen-share', 'false');
  });

  it('sets isLocalParticipant to true when mainParticipant is localParticipant', () => {
    const participant = createMockParticipant('E');

    mockUseMainParticipant.mockReturnValue(participant);
    mockUseSelectedParticipant.mockReturnValue([{}]);
    mockUseScreenShareParticipant.mockReturnValue({});
    mockUseVideoContext.mockReturnValue({ room: createMockRoom('mockroom', participant) });

    render(<MainParticipant />);

    const el = screen.getByTestId('participant-tracks');
    expect(el).toHaveAttribute('data-is-local', 'true');
  });

  it('sets videoPriority to null when not selected and not screen sharing', () => {
    const participant = createMockParticipant('F');

    mockUseMainParticipant.mockReturnValue(participant);
    mockUseSelectedParticipant.mockReturnValue([{}]);
    mockUseScreenShareParticipant.mockReturnValue({});
    mockUseVideoContext.mockReturnValue({ room: createMockRoom() });

    render(<MainParticipant />);

    const el = screen.getByTestId('participant-tracks');
    expect(el).not.toHaveAttribute('data-video-priority');
  });
});
