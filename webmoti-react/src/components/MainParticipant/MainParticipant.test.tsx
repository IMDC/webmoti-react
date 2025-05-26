import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from '@testing-library/react';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import MainParticipant from './MainParticipant';
import { createMockParticipant, createMockRoom } from '../../__mocks__/mockCreator';

vi.mock('../../hooks/useMainParticipant/useMainParticipant');
vi.mock('../VideoProvider/useSelectedParticipant/useSelectedParticipant');
vi.mock('../../hooks/useScreenShareParticipant/useScreenShareParticipant');
vi.mock('../../hooks/useVideoContext/useVideoContext');

vi.mock('../ParticipantTracks/ParticipantTracks', () => (props: any) => (
  <div
    data-testid="participant-tracks"
    data-video-priority={props.videoPriority}
    data-is-local={String(props.isLocalParticipant)}
    data-enable-screen-share={String(props.enableScreenShare)}
  />
));

vi.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext', () => () => ({}));

const mockUseMainParticipant = useMainParticipant as vi.Mock;
const mockUseSelectedParticipant = useSelectedParticipant as vi.Mock;
const mockUseScreenShareParticipant = useScreenShareParticipant as vi.Mock;
const mockUseVideoContext = useVideoContext as vi.Mock;

describe('MainParticipant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
