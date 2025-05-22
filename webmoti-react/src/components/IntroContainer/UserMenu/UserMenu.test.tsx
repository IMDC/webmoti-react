import { render, screen, fireEvent } from '@testing-library/react';

import UserMenu from './UserMenu';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import { clientEnv } from '../../../clientEnv';

jest.mock('../../../state');
jest.mock('../../../hooks/useVideoContext/useVideoContext');

const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

describe('the UserMenu component', () => {
  const mockTrack = { stop: jest.fn() };
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVideoContext.mockImplementation(() => ({ localTracks: [mockTrack] }));
    mockUseAppState.mockImplementation(() => ({
      user: { displayName: 'Test User' },
      signOut: mockSignOut,
    }));
  });

  describe('when logged in with firebase', () => {
    beforeAll(() => {
      (clientEnv.SET_AUTH as jest.Mock).mockReturnValue('firebase');
    });

    it('should open the menu when clicked', () => {
      render(<UserMenu />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /test user/i }));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should stop all tracks and sign out when logout is clicked', () => {
      render(<UserMenu />);
      fireEvent.click(screen.getByRole('button', { name: /test user/i }));
      fireEvent.click(screen.getByText('Logout'));

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('when logged in with passcode auth', () => {
    beforeAll(() => {
      (clientEnv.SET_AUTH as jest.Mock).mockReturnValue('passcode');
    });

    it('should stop all tracks and sign out when logout link is clicked', () => {
      render(<UserMenu />);
      fireEvent.click(screen.getByText('Logout'));

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
