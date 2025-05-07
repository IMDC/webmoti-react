import { EventEmitter } from 'events';

import { act } from 'react-dom/test-utils';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleChatButton, { ANIMATION_DURATION } from './ToggleChatButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { checkSystemMsg } from '../../../utils';

jest.mock('../../../hooks/useChatContext/useChatContext');
jest.mock('../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext');
jest.mock('../../../utils');

const mockUseChatContext = useChatContext as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

const mockConversation = new EventEmitter();
const mockToggleChatWindow = jest.fn();
mockUseChatContext.mockImplementation(() => ({
  setIsChatWindowOpen: mockToggleChatWindow,
  isChatWindowOpen: false,
  conversation: mockConversation,
}));

const mockSetIsBackgroundSelectionOpen = jest.fn();
mockUseVideoContext.mockImplementation(() => ({ setIsBackgroundSelectionOpen: mockSetIsBackgroundSelectionOpen }));

const mockUseWebmotiVideoContext = useWebmotiVideoContext as jest.Mock<any>;
mockUseWebmotiVideoContext.mockImplementation(() => ({}));

(checkSystemMsg as jest.Mock).mockImplementation(() => false);

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
    expect(indicator.className).toContain('hasUnreadMessages');
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
    expect(indicator.className).not.toContain('hasUnreadMessages');
  });

  it(`should add the 'animate' class for ${ANIMATION_DURATION}ms when a new message is received when the chat window is closed`, () => {
    jest.useFakeTimers();
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: false,
      conversation: mockConversation,
    }));

    render(<ToggleChatButton />);
    const indicatorRing = screen.getByTestId('chat-ring-animation');
    expect(indicatorRing.className).not.toContain('animate');

    act(() => {
      mockConversation.emit('messageAdded');
    });

    expect(indicatorRing.className).toContain('animate');

    act(() => {
      jest.advanceTimersByTime(ANIMATION_DURATION);
    });

    expect(indicatorRing.className).not.toContain('animate');
  });

  it(`should not add the 'animate' class when a new message is received when the chat window is open`, () => {
    mockUseChatContext.mockImplementationOnce(() => ({
      setIsChatWindowOpen: mockToggleChatWindow,
      isChatWindowOpen: true,
      conversation: mockConversation,
    }));

    render(<ToggleChatButton />);
    const indicatorRing = screen.getByTestId('chat-ring-animation');
    expect(indicatorRing.className).not.toContain('animate');

    act(() => {
      mockConversation.emit('messageAdded');
    });

    expect(indicatorRing.className).not.toContain('animate');
  });
});
