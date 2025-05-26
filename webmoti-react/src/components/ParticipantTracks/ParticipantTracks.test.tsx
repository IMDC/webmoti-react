import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { render, screen } from '@testing-library/react';
import ParticipantTracks from './ParticipantTracks';
import usePublications from '../../hooks/usePublications/usePublications';

vi.mock('../../hooks/usePublications/usePublications');

const mockUsePublications = usePublications as vi.Mock;

describe('ParticipantTracks', () => {
  const mockParticipant = { identity: 'mock', tracks: new Map() } as any;

  const createPublication = (overrides: Partial<any>) => ({
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    mockUsePublications.mockReset();
  });

  it('renders publications by default', () => {
    mockUsePublications.mockReturnValue([
      createPublication({ trackSid: 'video-1', kind: 'video', trackName: '' }),
      createPublication({ trackSid: 'audio-1', kind: 'audio', trackName: '' }),
    ]);

    render(<ParticipantTracks participant={mockParticipant} />);
    expect(screen.getByTestId('publication-video-1')).toBeInTheDocument();
    expect(screen.getByTestId('publication-audio-1').innerHTML).toBe('');
  });

  it('filters out screen share publications by default', () => {
    mockUsePublications.mockReturnValue([
      createPublication({ trackSid: 'screen', kind: 'video', trackName: 'screen' }),
      createPublication({ trackSid: 'cam', kind: 'video', trackName: '' }),
    ]);

    render(<ParticipantTracks participant={mockParticipant} />);
    expect(screen.getByTestId('publication-cam')).toBeInTheDocument();
    expect(screen.queryByTestId('publication-screen')).not.toBeInTheDocument();
  });

  it('shows only screen share if enableScreenShare is set and screen share exists', () => {
    mockUsePublications.mockReturnValue([
      createPublication({ trackSid: 'screen', kind: 'video', trackName: 'screen' }),
      createPublication({ trackSid: 'cam', kind: 'video', trackName: '' }),
    ]);

    render(<ParticipantTracks participant={mockParticipant} enableScreenShare />);
    expect(screen.getByTestId('publication-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('publication-cam')).not.toBeInTheDocument();
  });

  it('shows camera if screen share is not present and enableScreenShare is true', () => {
    mockUsePublications.mockReturnValue([createPublication({ trackSid: 'cam', kind: 'video', trackName: '' })]);

    render(<ParticipantTracks participant={mockParticipant} enableScreenShare />);
    expect(screen.getByTestId('publication-cam')).toBeInTheDocument();
  });
});
