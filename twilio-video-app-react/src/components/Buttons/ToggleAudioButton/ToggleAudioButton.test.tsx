import { mount } from 'enzyme';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';

import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';
import ToggleAudioButton from './ToggleAudioButton';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import EventEmitter from 'events';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

jest.mock('../../../hooks/useLocalAudioToggle/useLocalAudioToggle');
jest.mock('../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../hooks/useChatContext/useChatContext');
jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
const mockUseLocalAudioToggle = useLocalAudioToggle as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

const mockUseChatContext = useChatContext as jest.Mock<any>;
const mockConversation = new EventEmitter();
mockUseChatContext.mockImplementation(() => ({ conversation: mockConversation }));

const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({ isWebmotiVideo: () => true }));

describe('the ToggleAudioButton component', () => {
  beforeAll(() => {
    mockUseVideoContext.mockImplementation(() => ({ localTracks: [{ kind: 'audio' }] }));
  });

  it('should render correctly when audio is enabled', () => {
    mockUseLocalAudioToggle.mockImplementation(() => [true, () => {}]);
    const wrapper = mount(<ToggleAudioButton />);
    expect(wrapper.find(MicIcon).length).toEqual(1);
    expect(wrapper.text()).toContain('Mute');
  });

  it('should render correctly when audio is disabled', () => {
    mockUseLocalAudioToggle.mockImplementation(() => [false, () => {}]);
    const wrapper = mount(<ToggleAudioButton />);
    expect(wrapper.find(MicOffIcon).length).toEqual(1);
    expect(wrapper.text()).toContain('Unmute');
  });

  it('should render correctly when there are no audio tracks', () => {
    mockUseLocalAudioToggle.mockImplementation(() => [true, () => {}]);
    mockUseVideoContext.mockImplementationOnce(() => ({ localTracks: [{ kind: 'video' }] }));
    const wrapper = mount(<ToggleAudioButton />);
    expect(wrapper.find(MicIcon).length).toEqual(1);
    expect(wrapper.text()).toContain('No Audio');
    expect(wrapper.find('button').prop('disabled')).toBeTruthy();
  });

  it('should call the correct toggle function when clicked', () => {
    const mockFn = jest.fn();
    mockUseLocalAudioToggle.mockImplementation(() => [false, mockFn]);
    const wrapper = mount(<ToggleAudioButton />);
    wrapper.find('button').simulate('click');
    expect(mockFn).toHaveBeenCalled();
  });
});
