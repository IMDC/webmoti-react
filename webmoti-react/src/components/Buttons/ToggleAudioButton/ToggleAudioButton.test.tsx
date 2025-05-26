import { beforeAll, describe, expect, it, vi, Mock } from 'vitest';
import EventEmitter from 'events';

import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleAudioButton from './ToggleAudioButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { isWebmotiVideo } from '../../../utils';

vi.mock('../../../hooks/useLocalAudioToggle/useLocalAudioToggle');
vi.mock('../../../hooks/useVideoContext/useVideoContext');
vi.mock('../../../hooks/useChatContext/useChatContext');
vi.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
vi.mock('../../../utils');

const mockUseLocalAudioToggle = useLocalAudioToggle as Mock<any>;
const mockUseVideoContext = useVideoContext as Mock<any>;

const mockUseChatContext = useChatContext as Mock<any>;
const mockConversation = new EventEmitter();
mockUseChatContext.mockImplementation(() => ({ conversation: mockConversation }));

const mockUseWebmotiVideoContext = useWebmotiVideoContext as Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

(isWebmotiVideo as unknown as Mock).mockImplementation(() => true);

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
    const mockFn = vi.fn();
    mockUseLocalAudioToggle.mockImplementation(() => [false, mockFn]);

    render(<ToggleAudioButton />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mockFn).toHaveBeenCalled();
  });
});
