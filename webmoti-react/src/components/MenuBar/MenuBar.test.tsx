// import { Button, Grid, Typography } from '@material-ui/core';

import { act, render, screen } from '@testing-library/react';

import MenuBar from './MenuBar';
import { createMockConversation, createMockLocalTrack, createMockRoom } from '../../__mocks__/mockCreator';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import * as utils from '../../utils';
// import ToggleScreenShareButton from '../Buttons/ToggleScreenShareButton/ToggleScreenShareButton';
import useDevices from '../../hooks/useDevices/useDevices';

jest.mock('../../hooks/useRoomState/useRoomState');
jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../../hooks/useParticipants/useParticipants');
jest.mock('../../hooks/useChatContext/useChatContext');
jest.mock('../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');

jest.mock('@material-ui/core/useMediaQuery', () => jest.fn(() => false));

jest.mock('../../hooks/useDevices/useDevices');

const mockUseDevices = useDevices as jest.Mock<any>;

mockUseDevices.mockImplementation(() => ({ hasVideoInputDevices: true }));

const mockUseRoomState = useRoomState as jest.Mock<any>;
const mockUseParticipants = useParticipants as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;
const mockUseChatContext = useChatContext as jest.Mock<any>;
const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;

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
  sendHandRequest: jest.fn(() => Promise.resolve({ status: 200 })),
}));

describe('the MenuBar component', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        enumerateDevices: jest.fn().mockResolvedValue([]),
      },
    });
  });

  beforeEach(() => {
    //@ts-ignore
    utils.isMobile = false;
    process.env.VITE_DISABLE_TWILIO_CONVERSATIONS = 'false';
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

  // it('should render the ToggleChatButton when VITE_DISABLE_TWILIO_CONVERSATIONS is not true', () => {
  //   render(<MenuBar />);
  //   expect(screen.getByTestId('toggle-chat-button')).toBeInTheDocument();
  // });

  // it('should hide the ToggleChatButton when VITE_DISABLE_TWILIO_CONVERSATIONS is true', () => {
  //   process.env.VITE_DISABLE_TWILIO_CONVERSATIONS = 'true';
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
