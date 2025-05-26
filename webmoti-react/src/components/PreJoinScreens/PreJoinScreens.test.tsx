import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import React from 'react';

import { render, act } from '@testing-library/react';
import { useParams } from 'react-router-dom';

// import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import PreJoinScreens from './PreJoinScreens';
// import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { useAppState } from '../../state';

// @ts-ignore
delete window.location;

// @ts-ignore
window.location = {
  pathname: '',
  // @ts-ignore
  search: '',
  origin: '',
};

const mockReplaceState = vi.fn();
Object.defineProperty(window.history, 'replaceState', { value: mockReplaceState });

vi.mock('./MediaErrorSnackbar/MediaErrorSnackbar', () => {
  const mockFn = vi.fn(() => null);
  return {
    __esModule: true,
    default: mockFn,
  };
});

vi.mock('../../state');
vi.mock('react-router-dom', () => ({ useParams: vi.fn() }));
vi.mock('../../hooks/useVideoContext/useVideoContext');
const mockUseAppState = useAppState as vi.Mock<any>;
const mockUseParams = useParams as vi.Mock<any>;
const mockUseVideoContext = useVideoContext as vi.Mock<any>;

vi.mock(
  '../IntroContainer/IntroContainer',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children
);
vi.mock('./RoomNameScreen/RoomNameScreen', () => () => null);
vi.mock('./DeviceSelectionScreen/DeviceSelectionScreen', () => () => null);
vi.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

const mockUseWebmotiVideoContext = useWebmotiVideoContext as vi.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

describe('the PreJoinScreens component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockImplementation(() => ({ user: { displayName: 'Test User' } }));
    mockUseParams.mockImplementation(() => ({ URLRoomName: 'testRoom' }));
    mockUseWebmotiVideoContext.mockImplementation(() => ({}));
  });

  // ! Room name screen is not shown when using firebase auth
  // it('should update the URL to include the room name on submit', () => {
  //   const wrapper = shallow(<PreJoinScreens />);

  //   const setRoomName = wrapper.find(RoomNameScreen).prop('setRoomName');
  //   setRoomName('Test Room 123');

  //   const handleSubmit = wrapper.find(RoomNameScreen).prop('handleSubmit');
  //   handleSubmit({ preventDefault: () => {} } as any);

  //   expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/room/Test%20Room%20123');
  // });

  // it('should not update the URL when the app is deployed as a Twilio function', () => {
  //   // @ts-ignore
  //   window.location = { ...window.location, origin: 'https://video-app-1234-twil.io' };
  //   const wrapper = shallow(<PreJoinScreens />);

  //   const setRoomName = wrapper.find(RoomNameScreen).prop('setRoomName');
  //   setRoomName('Test Room 123');

  //   const handleSubmit = wrapper.find(RoomNameScreen).prop('handleSubmit');
  //   handleSubmit({ preventDefault: () => {} } as any);

  //   expect(window.history.replaceState).not.toHaveBeenCalled();
  // });

  // it('should switch to the DeviceSelection screen when a room name is submitted', () => {
  //   const wrapper = shallow(<PreJoinScreens />);

  //   expect(wrapper.find(RoomNameScreen).exists()).toBe(true);
  //   expect(wrapper.find(DeviceSelectionScreen).exists()).toBe(false);

  //   const handleSubmit = wrapper.find(RoomNameScreen).prop('handleSubmit');
  //   handleSubmit({ preventDefault: () => {} } as any);

  //   expect(wrapper.find(RoomNameScreen).exists()).toBe(false);
  //   expect(wrapper.find(DeviceSelectionScreen).exists()).toBe(true);
  // });

  // it('should populate the room name from the URL and switch to the DeviceSelectionScreen when the displayName is present for the user', () => {
  //   const wrapper = mount(<PreJoinScreens />);
  //   const roomName = wrapper.find(DeviceSelectionScreen).prop('roomName');
  //   expect(roomName).toBe('testRoom');

  //   expect(wrapper.find(RoomNameScreen).exists()).toBe(false);
  //   expect(wrapper.find(DeviceSelectionScreen).exists()).toBe(true);
  // });

  // it('should populate the room name from the URL and stay on the RoomNameScreen when the displayName is not present for the user', () => {
  //   mockUseAppState.mockImplementation(() => ({ user: {} }));
  //   const wrapper = mount(<PreJoinScreens />);
  //   const roomName = wrapper.find(RoomNameScreen).prop('roomName');
  //   expect(roomName).toBe('testRoom');

  //   expect(wrapper.find(RoomNameScreen).exists()).toBe(true);
  //   expect(wrapper.find(DeviceSelectionScreen).exists()).toBe(false);
  // });

  it('should capture errors from getAudioAndVideoTracks and pass them to the MediaErrorSnackbar component', async () => {
    const error = 'testError';
    const mockGetTracks = vi.fn(() => Promise.reject(error));
    mockUseVideoContext.mockImplementation(() => ({ getAudioAndVideoTracks: mockGetTracks }));

    await act(async () => {
      render(<PreJoinScreens />);
    });

    expect(mockGetTracks).toHaveBeenCalledTimes(1);

    const { default: mockMediaErrorSnackbar } = await vi.importMock('./MediaErrorSnackbar/MediaErrorSnackbar');

    expect(mockMediaErrorSnackbar).toHaveBeenCalledWith(expect.objectContaining({ error }), expect.anything());
  });
});
