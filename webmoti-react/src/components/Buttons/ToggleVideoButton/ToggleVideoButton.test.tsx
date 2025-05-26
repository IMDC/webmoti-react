import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleVideoButton from './ToggleVideoButton';
import useDevices from '../../../hooks/useDevices/useDevices';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

jest.mock('../../../hooks/useDevices/useDevices');
jest.mock('../../../hooks/useLocalVideoToggle/useLocalVideoToggle');

const mockUseLocalVideoToggle = useLocalVideoToggle as jest.Mock<any>;
const mockUseDevices = useDevices as jest.Mock<any>;

describe('the ToggleVideoButton component', () => {
  beforeAll(() => {
    mockUseDevices.mockImplementation(() => ({ hasVideoInputDevices: true }));
  });

  it('should render correctly when video is enabled', () => {
    mockUseLocalVideoToggle.mockImplementation(() => [true, jest.fn()]);

    render(<ToggleVideoButton />);
    expect(screen.getByTestId('video-on-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Stop My Video');
  });

  it('should render correctly when video is disabled', () => {
    mockUseLocalVideoToggle.mockImplementation(() => [false, jest.fn()]);

    render(<ToggleVideoButton />);
    expect(screen.getByTestId('video-off-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Start My Video');
  });

  it('should render correctly when no video devices exist', () => {
    mockUseLocalVideoToggle.mockImplementation(() => [true, jest.fn()]);
    mockUseDevices.mockImplementationOnce(() => ({ hasVideoInputDevices: false }));

    render(<ToggleVideoButton />);
    expect(screen.getByTestId('video-on-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('No Video');
  });

  it('should call the correct toggle function when clicked', async () => {
    const mockToggle = jest.fn();
    mockUseLocalVideoToggle.mockImplementation(() => [false, mockToggle]);

    render(<ToggleVideoButton />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockToggle).toHaveBeenCalled();
  });

  it('should throttle the toggle function to 200ms', async () => {
    const mockToggle = jest.fn();
    mockUseLocalVideoToggle.mockImplementation(() => [false, mockToggle]);

    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValue(100000);

    render(<ToggleVideoButton />);
    const button = screen.getByRole('button');

    await userEvent.click(button); // Should register
    expect(mockToggle).toHaveBeenCalledTimes(1);

    nowSpy.mockReturnValue(100500);
    await userEvent.click(button); // Should be ignored
    expect(mockToggle).toHaveBeenCalledTimes(1);

    nowSpy.mockReturnValue(100501);
    await userEvent.click(button); // Should register
    expect(mockToggle).toHaveBeenCalledTimes(2);

    nowSpy.mockRestore();
  });
});
