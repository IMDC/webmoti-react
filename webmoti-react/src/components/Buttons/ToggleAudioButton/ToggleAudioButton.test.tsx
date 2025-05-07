import EventEmitter from 'events';

import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleAudioButton from './ToggleAudioButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { isWebmotiVideo } from '../../../utils';

jest.mock('../../../hooks/useLocalAudioToggle/useLocalAudioToggle');
jest.mock('../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../hooks/useChatContext/useChatContext');
jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
jest.mock('../../../utils');

const mockUseLocalAudioToggle = useLocalAudioToggle as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

const mockUseChatContext = useChatContext as jest.Mock<any>;
const mockConversation = new EventEmitter();
mockUseChatContext.mockImplementation(() => ({ conversation: mockConversation }));

const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

(isWebmotiVideo as unknown as jest.Mock).mockImplementation(() => true);

describe('the ToggleAudioButton component', () => {
  beforeAll(() => {
    mockUseVideoContext.mockImplementation(() => ({ localTracks: [{ kind: 'audio' }] }));
  });

  it('should render correctly when audio is enabled', () => {
    mockUseLocalAudioToggle.mockImplementation(() => [true, () => {}]);

    render(<ToggleAudioButton />);
    const button = screen.getByRole('button');
    expect(within(button).getByText('Mute')).toBeInTheDocument();
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
  });

  it('should render correctly when audio is disabled', () => {
    mockUseLocalAudioToggle.mockImplementation(() => [false, () => {}]);

    render(<ToggleAudioButton />);
    expect(screen.getByTestId('mic-off-icon')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(within(button).getByText('Unmute')).toBeInTheDocument();
  });

  it('should render correctly when there are no audio tracks', () => {
    mockUseLocalAudioToggle.mockImplementation(() => [true, () => {}]);
    mockUseVideoContext.mockImplementationOnce(() => ({ localTracks: [{ kind: 'video' }] }));

    render(<ToggleAudioButton />);
    expect(screen.getByTestId('mic-icon')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(within(button).getByText('No Audio')).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should call the correct toggle function when clicked', async () => {
    const mockFn = jest.fn();
    mockUseLocalAudioToggle.mockImplementation(() => [false, mockFn]);

    render(<ToggleAudioButton />);
    const button = screen.getByRole('button');
    await userEvent.click(button)
    expect(mockFn).toHaveBeenCalled();
  });
});
