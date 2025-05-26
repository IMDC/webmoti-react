import { describe, expect, it, vi, Mock } from 'vitest';
import { EventEmitter } from 'events';

import { screen, render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleChatButton, { ANIMATION_DURATION } from './ToggleChatButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { checkSystemMsg } from '../../../utils';

vi.mock('../../../hooks/useChatContext/useChatContext');
vi.mock('../../../hooks/useVideoContext/useVideoContext');
vi.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
vi.mock('../../../utils');

const mockUseChatContext = useChatContext as Mock<any>;
const mockUseVideoContext = useVideoContext as Mock<any>;

const mockConversation = new EventEmitter();
const mockToggleChatWindow = vi.fn();
mockUseChatContext.mockImplementation(() => ({
  setIsChatWindowOpen: mockToggleChatWindow,
  isChatWindowOpen: false,
  conversation: mockConversation,
}));

const mockSetIsBackgroundSelectionOpen = vi.fn();
mockUseVideoContext.mockImplementation(() => ({ setIsBackgroundSelectionOpen: mockSetIsBackgroundSelectionOpen }));

const mockUseWebmotiVideoContext = useWebmotiVideoContext as Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

(checkSystemMsg as Mock).mockImplementation(() => false);

const mockMessage = {
  attachedMedia: [],
};

describe('the ToggleChatButton component', () => {
  it('should be enabled when a conversation is present', () => {
    render(<ToggleChatButton />);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should be disabled when a conversation is not present', () => {
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: false,
      conversation: null,
    }));

    render(<ToggleChatButton />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call the correct toggle function when clicked', async () => {
    render(<ToggleChatButton />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mockToggleChatWindow).toHaveBeenCalledWith(true);
  });

  it('should show an indicator when there are unread messages', () => {
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: false,
      conversation: mockConversation,
      hasUnreadMessages: true,
    }));

    render(<ToggleChatButton />);
    const indicator = screen.getByTestId('unread-indicator');
    expect(indicator).toHaveStyle('opacity: 1');
  });

  it('should not show an indicator when there are no unread messages', () => {
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: false,
      conversation: mockConversation,
      hasUnreadMessages: false,
    }));

    render(<ToggleChatButton />);
    const indicator = screen.getByTestId('unread-indicator');
    expect(indicator).not.toHaveStyle('opacity: 1');
  });

  it(`should add the 'animate' class for ${ANIMATION_DURATION}ms when a new message is received when the chat window is closed`, () => {
    vi.useFakeTimers();
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: false,
      conversation: mockConversation,
    }));

    render(<ToggleChatButton />);
    expect(screen.queryByTestId('chat-ring-animation')).toBeNull();

    act(() => {
      mockConversation.emit('messageAdded', mockMessage);
    });

    expect(screen.getByTestId('chat-ring-animation')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(ANIMATION_DURATION);
    });

    expect(screen.queryByTestId('chat-ring-animation')).toBeNull();
  });

  it(`should not add the 'animate' class when a new message is received when the chat window is open`, () => {
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: true,
      conversation: mockConversation,
    }));

    render(<ToggleChatButton />);
    expect(screen.queryByTestId('chat-ring-animation')).toBeNull();

    act(() => {
      mockConversation.emit('messageAdded', mockMessage);
    });

    expect(screen.queryByTestId('chat-ring-animation')).toBeNull();
  });
});
