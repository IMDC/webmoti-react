import { afterEach, describe, expect, it, vi, Mock } from "vitest";
import { render, screen } from '@testing-library/react';

import VideoInputList from './VideoInputList';
import { DEFAULT_VIDEO_CONSTRAINTS, SELECTED_VIDEO_INPUT_KEY } from '../../../constants';
import useDevices from '../../../hooks/useDevices/useDevices';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { renderWithUser } from '../../../utils/testUtils';

vi.mock('../../../hooks/useVideoContext/useVideoContext');
vi.mock('../../../hooks/useDevices/useDevices');
vi.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseVideoContext = useVideoContext as vi.Mock<any>;
const mockUseDevices = useDevices as vi.Mock<any>;
const mockGetLocalVideotrack = vi.fn(() => Promise.resolve);

const mockUseWebmotiVideoContext = useWebmotiVideoContext as vi.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

const mockDevice = {
  deviceId: '234',
  label: 'mock device',
};

const mockDevice2 = {
  deviceId: '2',
  label: 'mock device 2',
};

const mockLocalTrack = {
  kind: 'video',
  mediaStreamTrack: {
    label: 'mock local video track',
    getSettings: () => ({ deviceId: '234' }),
  },
  name: 'mock name',
  on: vi.fn(),
  off: vi.fn(),
  attach: vi.fn(),
  detach: vi.fn(),
  restart: vi.fn(),
};

mockUseVideoContext.mockImplementation(() => ({
  room: {},
  getLocalVideoTrack: mockGetLocalVideotrack,
  localTracks: [mockLocalTrack],
}));

describe('the VideoInputList component', () => {
  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  describe('with only one video input device', () => {
    it('should not display a Select menu and instead display the name of the local video track', () => {
      mockUseDevices.mockImplementation(() => ({ videoInputDevices: [mockDevice] }));
      render(<VideoInputList />);
      expect(screen.queryByRole('combobox')).toBeNull();
      expect(screen.getByTestId('video-device-name').textContent).toBe('mock local video track');
    });

    it('should display "No Local Video" when there is no local video track', () => {
      mockUseDevices.mockImplementation(() => ({ videoInputDevices: [mockDevice] }));
      mockUseVideoContext.mockImplementationOnce(() => ({
        room: {},
        getLocalVideoTrack: mockGetLocalVideotrack,
        localTracks: [],
      }));
      render(<VideoInputList />);
      expect(screen.getByTestId('video-device-name').textContent).toBe('No Local Video');
    });
  });

  it('should render a Select menu when there are multiple video input devices', () => {
    mockUseDevices.mockImplementation(() => ({ videoInputDevices: [mockDevice, mockDevice] }));
    render(<VideoInputList />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByTestId('video-device-name')).toBeNull();
  });

  it('should save the deviceId in localStorage when the video input device is changed', async () => {
    mockUseDevices.mockImplementation(() => ({ videoInputDevices: [mockDevice, mockDevice2] }));
    const { user } = renderWithUser(<VideoInputList />);
    expect(window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY)).toBe(null);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText(mockDevice2.label));

    expect(window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY)).toBe(mockDevice2.deviceId);
  });

  it('should call track.restart with the new deviceId when the video input device is changed', async () => {
    mockUseDevices.mockImplementation(() => ({ videoInputDevices: [mockDevice, mockDevice2] }));
    const { user } = renderWithUser(<VideoInputList />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText(mockDevice2.label));

    expect(mockLocalTrack.restart).toHaveBeenCalledWith({
      ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
      deviceId: { exact: mockDevice2.deviceId },
    });
  });

  it('should not call track.restart when no video track is present', async () => {
    mockUseDevices.mockImplementation(() => ({ videoInputDevices: [mockDevice, mockDevice2] }));
    mockUseVideoContext.mockImplementationOnce(() => ({
      room: {},
      getLocalVideoTrack: mockGetLocalVideotrack,
      localTracks: [],
    }));
    const { user } = renderWithUser(<VideoInputList />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText(mockDevice2.label));

    expect(mockLocalTrack.restart).not.toHaveBeenCalled();
  });
});
