import { describe, expect, it, vi, Mock } from "vitest";
import { screen } from '@testing-library/react';
import { renderWithUser } from '../../../utils/testUtils';

import ChatWindowHeader from './ChatWindowHeader';
import useChatContext from '../../../hooks/useChatContext/useChatContext';

vi.mock('../../../hooks/useChatContext/useChatContext');

const mockUseChatContext = useChatContext as vi.Mock<any>;

const mockToggleChatWindow = vi.fn();
mockUseChatContext.mockImplementation(() => ({ setIsChatWindowOpen: mockToggleChatWindow }));

describe('the CloseChatWindowHeader component', () => {
  it('should close the chat window when "X" is clicked on', async () => {
    const { user } = renderWithUser(<ChatWindowHeader />);
    const closeButton = screen.getByRole('button');

    await user.click(closeButton);
    expect(mockToggleChatWindow).toHaveBeenCalledWith(false);
  });
});
