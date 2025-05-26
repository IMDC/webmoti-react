import { describe, expect, it, vi, Mock } from "vitest";
import { render } from '@testing-library/react';

import LocalVideoPreview from './LocalVideoPreview';
import useVideoContext from '../../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

vi.mock('../../../../hooks/useVideoContext/useVideoContext');
vi.mock('../../../../hooks/useMediaStreamTrack/useMediaStreamTrack');
vi.mock('../../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseWebmotiVideoContext = useWebmotiVideoContext as vi.Mock<any>;

vi.mock('../../../VideoTrack/VideoTrack', () => ({
  __esModule: true,
  default: () => <div data-testid="video-track" />,
}));

vi.mock('../../../../icons/AvatarIcon', () => () => <div data-testid="avatar-icon" />);

const mockedVideoContext = useVideoContext as vi.Mock;

mockUseWebmotiVideoContext.mockImplementation(() => ({
  isMuted: false,
}));

describe('the LocalVideoPreview component', () => {
  it('should render a VideoTrack component when there is a "camera" track', () => {
    mockedVideoContext.mockImplementation(() => ({
      localTracks: [
        {
          name: '',
          kind: 'video',
          attach: vi.fn(),
          detach: vi.fn(),
          mediaStreamTrack: { getSettings: () => ({}) },
          on: vi.fn(),
          off: vi.fn(),
        },
      ],
    }));

    const { getByTestId, queryByTestId } = render(<LocalVideoPreview identity="Test User" />);
    expect(getByTestId('video-track')).toBeInTheDocument();
    expect(queryByTestId('avatar-icon')).not.toBeInTheDocument();
  });

  it('should render the AvatarIcon when there are no "camera" tracks', () => {
    mockedVideoContext.mockImplementation(() => ({
      localTracks: [
        {
          name: 'microphone',
          kind: 'audio',
          attach: vi.fn(),
          detach: vi.fn(),
          on: vi.fn(),
          off: vi.fn(),
        },
      ],
    }));

    const { getByTestId, queryByTestId } = render(<LocalVideoPreview identity="Test User" />);
    expect(getByTestId('avatar-icon')).toBeInTheDocument();
    expect(queryByTestId('video-track')).not.toBeInTheDocument();
  });
});
