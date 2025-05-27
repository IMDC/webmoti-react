import useFirebaseAuth from './useFirebaseAuth';
import { renderHook, waitFor } from '@testing-library/react';
import { setImmediate } from 'timers';
import { clientEnv } from '../../clientEnv';

const mockUser = { getIdToken: () => Promise.resolve('idToken') };

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => {
  const mockAuth = () => ({
    onAuthStateChanged: (fn: Function) => {
      setImmediate(() => fn('mockUser'));
      return jest.fn(() => {});
    },
    signOut: jest.fn(() => Promise.resolve()),
  });
  const mockSignInWithPopup = jest.fn(() => Promise.resolve({ user: mockUser }));
  const mockGoogleAuthProvider = jest.fn(() => ({ addScope: jest.fn() }));
  return {
    getAuth: mockAuth,
    signInWithPopup: mockSignInWithPopup,
    GoogleAuthProvider: mockGoogleAuthProvider,
  };
});

// @ts-expect-error: mock browser property
window.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ token: 'mockVideoToken' })),
    json: () => Promise.resolve({ token: 'mockVideoToken' }),
  })
);

describe('the useFirebaseAuth hook', () => {
  afterEach(jest.clearAllMocks);

  it('should set isAuthReady to true and set a user on load', async () => {
    const { result } = renderHook(() => useFirebaseAuth());
    expect(result.current.isAuthReady).toBe(false);
    expect(result.current.user).toBe(null);

    await waitFor(() => {
      expect(result.current.isAuthReady).toBe(true);
      expect(result.current.user).toBe('mockUser');
    });
  });

  it('should set user to null on signOut', async () => {
    const { result } = renderHook(() => useFirebaseAuth());
    await waitFor(() => {
      expect(result.current.isAuthReady).toBe(true);
    });
    result.current.signOut();
    await waitFor(() => {
      expect(result.current.isAuthReady).toBe(true);
      expect(result.current.user).toBe(null);
    });
  });

  it('should set a new user on signIn', async () => {
    const { result } = renderHook(() => useFirebaseAuth());
    await waitFor(() => {
      expect(result.current.isAuthReady).toBe(true);
    });
    result.current.signIn();
    await waitFor(() => {
      expect(result.current.user).toBe(mockUser);
    });
  });

  it('should include the users idToken in request to the video token server', async () => {
    (clientEnv.TOKEN_ENDPOINT as jest.Mock).mockReturnValue('http://test-endpoint.com/token');

    const { result } = renderHook(() => useFirebaseAuth());
    await waitFor(() => {
      expect(result.current.isAuthReady).toBe(true);
    });
    result.current.signIn();
    await waitFor(() => {
      expect(result.current.user).toBe(mockUser);
    });
    await result.current.getToken('testuser', 'testroom');

    const headers = new Headers({
      Authorization: 'Bearer idToken',
      'Content-Type': 'application/json',
    });

    expect(window.fetch).toHaveBeenCalledWith('http://test-endpoint.com/token', {
      headers,
      body: '{"user_identity":"testuser","room_name":"testroom","create_conversation":true}',
      method: 'POST',
    });
  });
});
