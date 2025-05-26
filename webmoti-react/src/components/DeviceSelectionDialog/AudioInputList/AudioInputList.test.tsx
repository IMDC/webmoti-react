import { render, screen } from '@testing-library/react';
import { renderWithUser } from '../../../utils/testUtils';

import AudioInputList from './AudioInputList';
import { SELECTED_AUDIO_INPUT_KEY } from '../../../constants';
import useDevices from '../../../hooks/useDevices/useDevices';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

jest.mock('../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
jest.mock('../../../hooks/useDevices/useDevices');

const mockUseVideoContext = useVideoContext as jest.Mock<any>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;
const mockUseDevices = useDevices as jest.Mock<any>;
const mockGetLocalAudiotrack = jest.fn(() => Promise.resolve);

const mockDevice1 = { deviceId: '123', label: 'Mic 1' };
const mockDevice2 = { deviceId: 'mockDeviceID', label: 'Mic 2' };

const mockLocalTrack = {
  kind: 'audio',
  mediaStreamTrack: {
    label: 'mock local audio track',
    getSettings: () => ({ deviceId: '234' }),
  },
  restart: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

mockUseVideoContext.mockImplementation(() => ({
  room: {},
  getLocalAudioTrack: mockGetLocalAudiotrack,
  localTracks: [mockLocalTrack],
}));

mockUseWebmotiVideoContext.mockImplementation(() => ({}));

describe('the AudioInputList component', () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should display the name of the local audio track when only one is avaiable', () => {
    mockUseDevices.mockImplementation(() => ({ audioInputDevices: [mockDevice1] }));
    render(<AudioInputList />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('mock local audio track')).toBeInTheDocument();
  });

  it('should display "No Local Audio" when there is no local audio track', () => {
    mockUseDevices.mockImplementation(() => ({ audioInputDevices: [mockDevice1] }));
    mockUseVideoContext.mockImplementationOnce(() => ({
      room: {},
      getLocalAudioTrack: mockGetLocalAudiotrack,
      localTracks: [],
    }));

    render(<AudioInputList />);
    expect(screen.getByText('No Local Audio')).toBeInTheDocument();
  });

  it('should render a Select menu when there are multiple audio input devices', () => {
    mockUseDevices.mockImplementation(() => ({ audioInputDevices: [mockDevice1, mockDevice2] }));

    render(<AudioInputList />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByText('mock local audio track')).not.toBeInTheDocument();
  });

  it('should save the deviceId in localStorage when the audio input device is changed', async () => {
    mockUseDevices.mockImplementation(() => ({ audioInputDevices: [mockDevice1, mockDevice2] }));

    const { user } = renderWithUser(<AudioInputList />);

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Mic 2'));

    expect(window.localStorage.getItem(SELECTED_AUDIO_INPUT_KEY)).toBe('mockDeviceID');
  });

  it('should call track.restart with the new deviceId when the audio input device is changed', async () => {
    mockUseDevices.mockImplementation(() => ({ audioInputDevices: [mockDevice1, mockDevice2] }));

    const { user } = renderWithUser(<AudioInputList />);
    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Mic 2'));

    expect(mockLocalTrack.restart).toHaveBeenCalledWith({
      deviceId: { exact: 'mockDeviceID' },
    });
  });
});
