import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BackgroundSelectionHeader from './BackgroundSelectionHeader';

const mockCloseDialog = jest.fn();

describe('The Background Selection Header Component', () => {
  it('should close the selection dialog when "X" is clicked', async () => {
    render(<BackgroundSelectionHeader onClose={mockCloseDialog} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mockCloseDialog).toHaveBeenCalled();
  });
});
