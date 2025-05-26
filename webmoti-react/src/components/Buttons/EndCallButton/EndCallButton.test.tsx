import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';

import EndCallButton from './EndCallButton';
import useChatContext from '../../../hooks/useChatContext/useChatContext';

vi.mock('../../../hooks/useChatContext/useChatContext');

const mockDisconnect = vi.fn();

vi.mock('../../../hooks/useVideoContext/useVideoContext', () => () => ({
  room: {
    disconnect: mockDisconnect,
  },
}));

describe('EndCallButton', () => {
  beforeEach(() => {
    (useChatContext as vi.Mock).mockReturnValue({});
    mockDisconnect.mockClear();
  });

  it('calls room.disconnect when clicked', () => {
    render(<EndCallButton />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
