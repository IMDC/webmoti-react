import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { useAppState } from '../../state';
import { clientEnv } from '../../clientEnv';

jest.mock('../../state');
const mockUseAppState = useAppState as jest.Mock<any>;

const MockComponent = () => <h1>test</h1>;

describe('PrivateRoute', () => {
  describe('with auth enabled', () => {
    beforeEach(() => {
      (clientEnv.SET_AUTH as jest.Mock).mockReturnValue('firebase');
    });

    it('redirects to /login when no user and auth is ready', () => {
      mockUseAppState.mockReturnValue({ user: null, isAuthReady: true });

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <h1>test</h1>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<h1>login</h1>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('login')).toBeInTheDocument();
      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });

    it('renders children when user is present and auth is ready', () => {
      mockUseAppState.mockReturnValue({ user: {}, isAuthReady: true });

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MockComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('renders nothing when auth is not ready', () => {
      mockUseAppState.mockReturnValue({ user: null, isAuthReady: false });

      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MockComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('with auth disabled', () => {
    it('renders children regardless of user or authReady', () => {
      (clientEnv.SET_AUTH as jest.Mock).mockReturnValue("none");
      mockUseAppState.mockReturnValue({ user: null, isAuthReady: false });

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MockComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});
