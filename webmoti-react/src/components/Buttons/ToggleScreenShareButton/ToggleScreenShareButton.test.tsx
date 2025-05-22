import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

import ToggleScreenShareButton, {
  SCREEN_SHARE_TEXT,
  SHARE_IN_PROGRESS_TEXT,
  SHARE_NOT_SUPPORTED_TEXT,
} from './ToggleScreenShareButton';

jest.mock('../../../hooks/useScreenShareParticipant/useScreenShareParticipant');
jest.mock('../../../hooks/useVideoContext/useVideoContext');

const mockUseScreenShareParticipant = useScreenShareParticipant as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

const mockToggleScreenShare = jest.fn();
mockUseVideoContext.mockImplementation(() => ({ toggleScreenShare: mockToggleScreenShare }));

describe('the ToggleScreenShareButton component', () => {
  it('should render correctly when screenSharing is allowed', () => {
    render(<ToggleScreenShareButton />);

    const icon = screen.getByTestId('screen-share-icon');
    expect(icon).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(SCREEN_SHARE_TEXT);
  });

  it('should render correctly when another user is sharing their screen', () => {
    mockUseScreenShareParticipant.mockImplementationOnce(() => 'mockParticipant');
    render(<ToggleScreenShareButton />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    expect(screen.getByLabelText(SHARE_IN_PROGRESS_TEXT)).toBeInTheDocument();
  });

  it('should call the correct toggle function when clicked', async () => {
    render(<ToggleScreenShareButton />);
    const button = screen.getByRole('button');

    await userEvent.click(button);
    expect(mockToggleScreenShare).toHaveBeenCalled();
  });

  it('should render the screenshare button with the correct messaging if screensharing is not supported', () => {
    Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    render(<ToggleScreenShareButton />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByLabelText(SHARE_NOT_SUPPORTED_TEXT)).toBeInTheDocument();

    Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });
  });
});
