import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import { useAppState } from '../../state';
import { clientEnv } from '../../clientEnv';

vi.mock('react-router-dom', () => {
  return {
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
  };
});
vi.mock('../../state');
vi.mock('./google-logo.svg', () => ({ ReactComponent: () => null }));

const mockUseAppState = useAppState as vi.Mock<any>;
const mockUseLocation = useLocation as vi.Mock<any>;
const mockUseNavigate = useNavigate as vi.Mock<any>;

const mockNavigate = vi.fn();
mockUseNavigate.mockImplementation(() => mockNavigate);
mockUseLocation.mockImplementation(() => ({ pathname: '/login' }));

describe('the LoginPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (clientEnv.SET_AUTH as vi.Mock).mockReturnValue('firebase');
  });

  describe('with auth enabled', () => {
    it('should redirect to "/" when there is a user ', () => {
      mockUseAppState.mockImplementation(() => ({ user: {}, signIn: () => Promise.resolve(), isAuthReady: true }));
      render(<LoginPage />);
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should render the login page when there is no user', () => {
      mockUseAppState.mockImplementation(() => ({ user: null, signIn: () => Promise.resolve(), isAuthReady: true }));
      const { getByText } = render(<LoginPage />);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(getByText('Sign in with Google')).toBeTruthy();
    });

    it('should redirect the user to "/" after signIn when there is no previous location', async () => {
      mockUseAppState.mockImplementation(() => ({ user: null, signIn: () => Promise.resolve(), isAuthReady: true }));
      const { getByText } = render(<LoginPage />);
      getByText('Sign in with Google').click();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should redirect the user to their previous location after signIn', async () => {
      mockUseLocation.mockImplementation(() => ({ state: { from: { pathname: '/room/test' } } }));
      mockUseAppState.mockImplementation(() => ({ user: null, signIn: () => Promise.resolve(), isAuthReady: true }));
      const { getByText } = render(<LoginPage />);
      getByText('Sign in with Google').click();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/room/test', { replace: true });
      });
    });

    it('should not render anything when isAuthReady is false', () => {
      mockUseAppState.mockImplementation(() => ({ user: null, signIn: () => Promise.resolve(), isAuthReady: false }));
      const { container } = render(<LoginPage />);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(container.children[0]).toBe(undefined);
    });
  });

  describe('with passcode auth enabled', () => {
    beforeEach(() => {
      (clientEnv.SET_AUTH as vi.Mock).mockReturnValue('passcode');
    });

    it('should call sign in with the supplied passcode', async () => {
      const mockSignin = vi.fn(() => Promise.resolve());
      mockUseAppState.mockImplementation(() => ({ user: null, signIn: mockSignin, isAuthReady: true }));
      const { getByLabelText, getByText } = render(<LoginPage />);

      act(() => {
        fireEvent.change(getByLabelText('Passcode'), { target: { value: '1234' } });
      });
      act(() => {
        fireEvent.submit(getByText('Submit'));
      });

      await waitFor(() => {
        expect(mockSignin).toHaveBeenCalledWith('1234');
      });
    });

    it('should call render error messages when signin fails', async () => {
      const mockSignin = vi.fn(() => Promise.reject(new Error('Test Error')));
      mockUseAppState.mockImplementation(() => ({ user: null, signIn: mockSignin, isAuthReady: true }));
      const { getByLabelText, getByText } = render(<LoginPage />);

      act(() => {
        fireEvent.change(getByLabelText('Passcode'), { target: { value: '1234' } });
      });

      act(() => {
        fireEvent.submit(getByText('Submit'));
      });

      const element = await waitFor(() => getByText('Test Error'));
      expect(element).toBeTruthy();
    });
  });

  it('should redirect to "/" when auth is disabled', () => {
    (clientEnv.SET_AUTH as vi.Mock).mockReturnValue(undefined);
    mockUseAppState.mockImplementation(() => ({ user: null, signIn: () => Promise.resolve(), isAuthReady: true }));
    render(<LoginPage />);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
