import { render } from '@testing-library/react';

import LocalVideoPreview from './LocalVideoPreview';
import useVideoContext from '../../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

jest.mock('../../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../../hooks/useMediaStreamTrack/useMediaStreamTrack');
jest.mock('../../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;

jest.mock('../../../VideoTrack/VideoTrack', () => ({
  __esModule: true,
  default: () => <div data-testid="video-track" />,
}));

jest.mock('../../../../icons/AvatarIcon', () => () => <div data-testid="avatar-icon" />);

const mockedVideoContext = useVideoContext as jest.Mock;

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
          attach: jest.fn(),
          detach: jest.fn(),
          mediaStreamTrack: { getSettings: () => ({}) },
          on: jest.fn(),
          off: jest.fn(),
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
          attach: jest.fn(),
          detach: jest.fn(),
          on: jest.fn(),
          off: jest.fn(),
        },
      ],
    }));

    const { getByTestId, queryByTestId } = render(<LocalVideoPreview identity="Test User" />);
    expect(getByTestId('avatar-icon')).toBeInTheDocument();
    expect(queryByTestId('video-track')).not.toBeInTheDocument();
  });
});
