import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from '@testing-library/react';

import MenuBar from './MenuBar';
import { createMockConversation, createMockLocalTrack, createMockRoom } from '../../__mocks__/mockCreator';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useDevices from '../../hooks/useDevices/useDevices';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import * as utils from '../../utils';
import { clientEnv } from '../../clientEnv';

vi.mock('../../hooks/useRoomState/useRoomState');
vi.mock('../../hooks/useVideoContext/useVideoContext');
vi.mock('../../hooks/useParticipants/useParticipants');
vi.mock('../../hooks/useChatContext/useChatContext');
vi.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

vi.mock('@mui/material/useMediaQuery', () => vi.fn(() => false));

vi.mock('../../hooks/useDevices/useDevices');

const mockUseDevices = useDevices as vi.Mock<any>;

mockUseDevices.mockImplementation(() => ({ hasVideoInputDevices: true }));

const mockUseRoomState = useRoomState as vi.Mock<any>;
const mockUseParticipants = useParticipants as vi.Mock<any>;
const mockUseVideoContext = useVideoContext as vi.Mock<any>;
const mockUseChatContext = useChatContext as vi.Mock<any>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as vi.Mock<any>;

const mockAudioTrack = createMockLocalTrack('audio');
const mockVideoTrack = createMockLocalTrack('video');

mockUseVideoContext.mockImplementation(() => ({
  isSharingScreen: false,
  toggleScreenShare: () => {},
  room: createMockRoom('Test Room'),
  localTracks: [mockAudioTrack, mockVideoTrack],
}));

mockUseRoomState.mockImplementation(() => 'connected');
mockUseParticipants.mockImplementation(() => ['mockRemoteParticpant', 'mockRemoteParticpant2']);
mockUseChatContext.mockImplementation(() => ({
  conversation: createMockConversation(),
}));
mockUseWebmotiVideoContext.mockImplementation(() => ({
  sendHandRequest: vi.fn(() => Promise.resolve({ status: 200 })),
}));

describe('the MenuBar component', () => {
  beforeEach(() => {
    //@ts-ignore
    utils.isMobile = false;
    (clientEnv.DISABLE_TWILIO_CONVERSATIONS as vi.Mock).mockReturnValue('false');
  });

  // TODO move ToggleScreenShareButton tests to Menu.test.tsx (toggleScreenShare was moved to menu)

  it('should disable toggle buttons while reconnecting to the room', async () => {
    mockUseRoomState.mockImplementationOnce(() => 'reconnecting');
    await act(async () => {
      render(<MenuBar />);
    });
    expect(screen.getByTestId('toggle-audio-button')).toBeDisabled();
    expect(screen.getByTestId('toggle-video-button')).toBeDisabled();
    // expect(wrapper.find(ToggleScreenShareButton).prop('disabled')).toBe(true);
  });

  // it('should enable toggle buttons while connected to the room', async () => {
  //   mockUseRoomState.mockImplementationOnce(() => 'reconnecting');

  //   await act(async () => {
  //     render(<MenuBar />);
  //   });
  //   expect(screen.getByTestId('toggle-audio-button')).not.toBeDisabled();
  //   expect(screen.getByTestId('toggle-video-button')).not.toBeDisabled();
  //   // expect(wrapper.find(ToggleScreenShareButton).prop('disabled')).toBe(false);
  // });

  // it('should hide the ToggleScreenShareButton and show the "You are sharing your screen" banner when isSharingScreen is true', () => {
  //   mockUseVideoContext.mockImplementationOnce(() => ({
  //     isSharingScreen: true,
  //     toggleScreenShare: () => {},
  //     room: { name: 'Test Room' },
  //   }));
  //   const wrapper = shallow(<MenuBar />);
  //   expect(wrapper.find(ToggleScreenShareButton).exists()).toBe(false);
  //   expect(wrapper.find(Grid).at(0).find(Typography).text()).toBe('You are sharing your screen');
  // });

  // it('should display the ToggleScreenShareButton when isSharingScreen is false and isMobile is false', () => {
  //   mockUseVideoContext.mockImplementationOnce(() => ({
  //     isSharingScreen: false,
  //     toggleScreenShare: () => {},
  //     room: { name: 'Test Room' },
  //   }));
  //   const wrapper = shallow(<MenuBar />);
  //   expect(wrapper.find(ToggleScreenShareButton).exists()).toBe(true);
  // });

  // it('should hide the ToggleScreenShareButton when isSharingScreen is false and isMobile is true', () => {
  //   mockUseVideoContext.mockImplementationOnce(() => ({
  //     isSharingScreen: false,
  //     toggleScreenShare: () => {},
  //     room: { name: 'Test Room' },
  //   }));
  //   // @ts-ignore
  //   utils.isMobile = true;
  //   const wrapper = shallow(<MenuBar />);
  //   expect(wrapper.find(ToggleScreenShareButton).exists()).toBe(false);
  // });

  // it('should render the ToggleChatButton when REACT_APP_DISABLE_TWILIO_CONVERSATIONS is not true', () => {
  //   render(<MenuBar />);
  //   expect(screen.getByTestId('toggle-chat-button')).toBeInTheDocument();
  // });

  // it('should hide the ToggleChatButton when REACT_APP_DISABLE_TWILIO_CONVERSATIONS is true', () => {
  //   (clientEnv.DISABLE_TWILIO_CONVERSATIONS as jest.Mock).mockReturnValue('true');
  //   render(<MenuBar />);
  //   expect(screen.getByTestId('toggle-chat-button')).not.toBeInTheDocument();
  // });

  // it('should call toggleScreenShare when the "Stop Sharing" button is clicked', () => {
  //   const mockToggleScreenShare = jest.fn();
  //   mockUseVideoContext.mockImplementationOnce(() => ({
  //     isSharingScreen: true,
  //     toggleScreenShare: mockToggleScreenShare,
  //     room: { name: 'Test Room' },
  //   }));
  //   const wrapper = shallow(<MenuBar />);

  //   wrapper
  //     .find(Grid)
  //     .at(0)
  //     .find(Button)
  //     .simulate('click');

  //   expect(mockToggleScreenShare).toHaveBeenCalledTimes(1);
  // });

  // Test Room (room name) is hidden in dev mode
  // it('should correctly display the number of participants in a room when there is more than 1 participant', () => {
  //   const wrapper = shallow(<MenuBar />);
  //   expect(wrapper.find('WithStyles(ForwardRef(Typography))').at(0).text()).toContain('3 participants');
  // });

  // it('should correctly display the number of participants in a room when there is exactly 1 participant', () => {
  //   mockUseParticipants.mockImplementationOnce(() => []);
  //   const wrapper = shallow(<MenuBar />);
  //   expect(wrapper.find('WithStyles(ForwardRef(Typography))').at(0).text()).toContain('1 participant');
  // });
});
