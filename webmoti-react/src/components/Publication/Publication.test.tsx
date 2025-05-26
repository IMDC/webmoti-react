import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { render } from '@testing-library/react';
import Publication from './Publication';
import useTrack from '../../hooks/useTrack/useTrack';
import * as VideoTrackModule from '../VideoTrack/VideoTrack';

vi.mock('../../hooks/useTrack/useTrack');
vi.mock('../VideoTrack/VideoTrack', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="video-track" />),
}));

const mockUseTrack = useTrack as vi.Mock;

describe('the Publication component', () => {
  const mockPublication = 'mockPublication' as any;
  const mockParticipant = { identity: 'some-user' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when track.kind is "video"', () => {
    it('should render a VideoTrack', () => {
      mockUseTrack.mockImplementation(() => ({ kind: 'video', name: '' }));

      const { getByTestId } = render(
        <Publication
          isLocalParticipant
          publication={mockPublication}
          participant={mockParticipant}
        />
      );

      expect(useTrack).toHaveBeenCalledWith('mockPublication');
      expect(getByTestId('video-track')).toBeInTheDocument();
    });

    it('should ignore the "isLocalParticipant" prop when track.name contains "screen"', () => {
      mockUseTrack.mockImplementation(() => ({ kind: 'video', name: 'screen-123456' }));

      render(
        <Publication
          isLocalParticipant
          publication={mockPublication}
          participant={mockParticipant}
        />
      );

      expect(VideoTrackModule.default).toHaveBeenCalledWith(
        expect.objectContaining({ isLocal: false }),
        expect.anything()
      );
    });

    it('should use "isLocalParticipant" when track.name does not contain "screen"', () => {
      mockUseTrack.mockImplementation(() => ({ kind: 'video', name: '' }));

      render(
        <Publication
          isLocalParticipant
          publication={mockPublication}
          participant={mockParticipant}
        />
      );

      expect(VideoTrackModule.default).toHaveBeenCalledWith(
        expect.objectContaining({ isLocal: true }),
        expect.anything()
      );
    });
  });
});
