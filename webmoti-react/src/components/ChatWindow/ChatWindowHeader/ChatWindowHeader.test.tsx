import { screen } from '@testing-library/react';
import { renderWithUser } from '../../../utils/testUtils';

import ChatWindowHeader from './ChatWindowHeader';
import useChatContext from '../../../hooks/useChatContext/useChatContext';

jest.mock('../../../hooks/useChatContext/useChatContext');

const mockUseChatContext = useChatContext as jest.Mock<any>;

const mockToggleChatWindow = jest.fn();
mockUseChatContext.mockImplementation(() => ({ setIsChatWindowOpen: mockToggleChatWindow }));

describe('the CloseChatWindowHeader component', () => {
  it('should close the chat window when "X" is clicked on', async () => {
    const { user } = renderWithUser(<ChatWindowHeader />);
    const closeButton = screen.getByRole('button');

    await user.click(closeButton);
    expect(mockToggleChatWindow).toHaveBeenCalledWith(false);
  });
});
