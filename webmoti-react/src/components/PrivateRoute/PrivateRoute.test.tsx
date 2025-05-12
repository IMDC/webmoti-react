import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { useAppState } from '../../state';

jest.mock('../../state');
const mockUseAppState = useAppState as jest.Mock<any>;

const MockComponent = () => <h1>test</h1>;

describe('PrivateRoute', () => {
  describe('with auth enabled', () => {
    beforeEach(() => {
      process.env.VITE_SET_AUTH = 'firebase';
    });

    it('redirects to /login when no user and auth is ready', () => {
      mockUseAppState.mockReturnValue({ user: null, isAuthReady: true });

      render(
        <MemoryRouter initialEntries={['/']}>
          <Switch>
            <PrivateRoute exact path="/">
              <h1>test</h1>
            </PrivateRoute>
            <Route path="/login">
              <h1>login</h1>
            </Route>
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByText('login')).toBeInTheDocument();
      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });

    it('renders children when user is present and auth is ready', () => {
      mockUseAppState.mockReturnValue({ user: {}, isAuthReady: true });

      render(
        <MemoryRouter initialEntries={['/']}>
          <PrivateRoute exact path="/" component={MockComponent} />
        </MemoryRouter>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('renders nothing when auth is not ready', () => {
      mockUseAppState.mockReturnValue({ user: null, isAuthReady: false });

      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <PrivateRoute exact path="/" component={MockComponent} />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('with auth disabled', () => {
    it('renders children regardless of user or authReady', () => {
      delete process.env.VITE_SET_AUTH;
      mockUseAppState.mockReturnValue({ user: null, isAuthReady: false });

      render(
        <MemoryRouter initialEntries={['/']}>
          <PrivateRoute exact path="/" component={MockComponent} />
        </MemoryRouter>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});
