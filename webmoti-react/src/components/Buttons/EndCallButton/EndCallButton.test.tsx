import { render, screen, fireEvent } from '@testing-library/react';

import EndCallButton from './EndCallButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';

jest.mock('../../../hooks/useChatContext/useChatContext');

const mockDisconnect = jest.fn();

jest.mock('../../../hooks/useVideoContext/useVideoContext', () => () => ({
  room: {
    disconnect: mockDisconnect,
  },
}));

describe('EndCallButton', () => {
  beforeEach(() => {
    (useChatContext as jest.Mock).mockReturnValue({});
    mockDisconnect.mockClear();
  });

  it('calls room.disconnect when clicked', () => {
    render(<EndCallButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
