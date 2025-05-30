import { render } from '@testing-library/react';
import Publication from './Publication';
import useTrack from '../../hooks/useTrack/useTrack';
import * as VideoTrackModule from '../VideoTrack/VideoTrack';

jest.mock('../../hooks/useTrack/useTrack');
jest.mock('../VideoTrack/VideoTrack', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="video-track" />),
}));

const mockUseTrack = useTrack as jest.Mock;
const mockVideoTrack = VideoTrackModule.default as jest.Mock;

describe('the Publication component', () => {
  const mockPublication = 'mockPublication' as any;
  const mockParticipant = { identity: 'some-user' } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when track.kind is "video"', () => {
    it('should render a VideoTrack', () => {
      mockUseTrack.mockImplementation(() => ({ kind: 'video', name: '' }));

      const { getByTestId } = render(
        <Publication isLocalParticipant publication={mockPublication} participant={mockParticipant} />
      );

      expect(useTrack).toHaveBeenCalledWith('mockPublication');
      expect(getByTestId('video-track')).toBeInTheDocument();
    });

    it('should ignore the "isLocalParticipant" prop when track.name contains "screen"', () => {
      mockUseTrack.mockImplementation(() => ({ kind: 'video', name: 'screen-123456' }));

      render(<Publication isLocalParticipant publication={mockPublication} participant={mockParticipant} />);

      const calls = mockVideoTrack.mock.calls;
      const matchedCall = calls.find(([props]) => {
        const isLocal = props?.isLocal;
        const trackName = props?.track?.name || '';
        return isLocal === false && trackName.includes('screen');
      });
      expect(matchedCall).toBeDefined();
    });

    it('should use "isLocalParticipant" when track.name does not contain "screen"', () => {
      mockUseTrack.mockImplementation(() => ({ kind: 'video', name: '' }));

      render(<Publication isLocalParticipant publication={mockPublication} participant={mockParticipant} />);

      const calls = mockVideoTrack.mock.calls;
      const matchedCall = calls.find(([props]) => {
        const isLocal = props?.isLocal;
        const trackName = props?.track?.name || '';
        return isLocal === true && !trackName.includes('screen');
      });
      expect(matchedCall).toBeDefined();
    });
  });
});
