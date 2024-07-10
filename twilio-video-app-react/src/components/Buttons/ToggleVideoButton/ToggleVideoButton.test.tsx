import { mount } from 'enzyme';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

import ToggleVideoButton from './ToggleVideoButton';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';
import useDevices from '../../../hooks/useDevices/useDevices';

jest.mock('../../../hooks/useDevices/useDevices');
jest.mock('../../../hooks/useLocalVideoToggle/useLocalVideoToggle');

const mockUseLocalVideoToggle = useLocalVideoToggle as jest.Mock<any>;
const mockUseDevices = useDevices as jest.Mock<any>;

describe('the ToggleVideoButton component', () => {
  beforeAll(() => {
    mockUseDevices.mockImplementation(() => ({ hasVideoInputDevices: true }));
  });

  it('should render correctly when video is enabled', () => {
    mockUseLocalVideoToggle.mockImplementation(() => [true, () => {}]);
    const wrapper = mount(<ToggleVideoButton />);
    expect(wrapper.find(VideoOnIcon)).toHaveLength(1);
    expect(wrapper.text()).toBe('Stop My Video');
  });

  it('should render correctly when video is disabled', () => {
    mockUseLocalVideoToggle.mockImplementation(() => [false, () => {}]);
    const wrapper = mount(<ToggleVideoButton />);
    expect(wrapper.find(VideoOffIcon)).toHaveLength(1);
    expect(wrapper.text()).toBe('Start My Video');
  });

  it('should render correctly when no video devices exist', () => {
    mockUseLocalVideoToggle.mockImplementation(() => [true, () => {}]);
    mockUseDevices.mockImplementationOnce(() => ({ hasVideoInputDevices: false }));
    const wrapper = mount(<ToggleVideoButton />);
    expect(wrapper.find(VideoOnIcon)).toHaveLength(1);
    expect(wrapper.find('button').prop('disabled')).toEqual(true);
    expect(wrapper.text()).toBe('No Video');
  });

  it('should call the correct toggle function when clicked', () => {
    const mockFn = jest.fn();
    mockUseLocalVideoToggle.mockImplementation(() => [false, mockFn]);
    const wrapper = mount(<ToggleVideoButton />);
    wrapper.find('button').simulate('click');
    expect(mockFn).toHaveBeenCalled();
  });

  it('should throttle the toggle function to 200ms', () => {
    const mockFn = jest.fn();
    mockUseLocalVideoToggle.mockImplementation(() => [false, mockFn]);
    const wrapper = mount(<ToggleVideoButton />);
    Date.now = () => 100000;
    wrapper.find('button').simulate('click'); // Should register
    Date.now = () => 100500;
    wrapper.find('button').simulate('click'); // Should be ignored
    Date.now = () => 100501;
    wrapper.find('button').simulate('click'); // Should register
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
