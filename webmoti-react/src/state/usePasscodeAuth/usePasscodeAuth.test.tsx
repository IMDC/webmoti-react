import * as React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import usePasscodeAuth, { getPasscode, verifyPasscode } from './usePasscodeAuth';
import { clientEnv } from '../../clientEnv';

const navigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const wrapper = (props: React.PropsWithChildren<unknown>) => (
  <MemoryRouter initialEntries={['/test-pathname']}>{props.children}</MemoryRouter>
);

function mockLocationSearch(search: string): () => void {
  const original = window.location;

  delete (window as any).location;
  (window as any).location = {
    ...original,
    search,
    href: `http://localhost${search}`,
    origin: 'http://test-origin',
    pathname: '/test-pathname',
  };

  return () => {
    (window as any).location = original;
  };
}

describe('the usePasscodeAuth hook', () => {
  describe('on first render', () => {
    beforeEach(() => {
      navigate.mockClear();
      window.sessionStorage.clear();
    });

    it('should return a user when the passcode is valid', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current).toMatchObject({ isAuthReady: true, user: { passcode: '123123' } });
      });
    });

    it('should remove the query parameter from the URL when the passcode is valid', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );

      const restoreLocation = mockLocationSearch('?passcode=000000');

      Object.defineProperty(window.history, 'replaceState', { value: jest.fn() });
      window.sessionStorage.setItem('passcode', '123123');
      renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(navigate).toHaveBeenLastCalledWith('/test-pathname', { replace: true });
      });

      restoreLocation();
    });

    it('should not return a user when the app code is invalid', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ status: 401, json: () => Promise.resolve({ type: 'errorMessage' }) })
      );
      window.location.search = '';
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current).toMatchObject({ isAuthReady: true, user: null });
      });
    });

    it('should not return a user when there is no passcode', () => {
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      expect(result.current).toMatchObject({ isAuthReady: true, user: null });
    });
  });

  describe('signout function', () => {
    it('should clear session storage and user on signout', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });

      await act(async () => {
        await result.current.signOut();
      });
      expect(window.sessionStorage.getItem('passcode')).toBe(null);
      expect(result.current.user).toBe(null);
    });
  });

  describe('signin function', () => {
    it('should set a user when a valid passcode is submitted', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await act(() => result.current.signIn('123456'));
      expect(result.current.user).toEqual({ passcode: '123456' });
    });

    it('should return an error when an invalid passcode is submitted', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ status: 401, json: () => Promise.resolve({ error: { message: 'passcode incorrect' } }) })
      );
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });
      result.current.signIn('123456').catch((err) => {
        expect(err.message).toBe('Passcode is incorrect');
      });
    });

    it('should return an error when an expired passcode is submitted', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ status: 401, json: () => Promise.resolve({ error: { message: 'passcode expired' } }) })
      );
      const { result } = renderHook(usePasscodeAuth, { wrapper });

      // await waitForNextUpdate();

      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });
      result.current.signIn('123456').catch((err) => {
        expect(err.message).toBe('Passcode has expired');
      });
    });
  });

  describe('the getToken function', () => {
    it('should call the API with the correct parameters', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });

      await act(async () => {
        result.current.getToken('test-name', 'test-room');
      });

      expect(window.fetch).toHaveBeenLastCalledWith('/token', {
        body: '{"user_identity":"test-name","room_name":"test-room","passcode":"123123","create_room":true,"create_conversation":true}',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
    });

    it('should call the API with the correct parameters when VITE_DISABLE_TWILIO_CONVERSATIONS is true', async () => {
      (clientEnv.DISABLE_TWILIO_CONVERSATIONS as jest.Mock).mockReturnValue('true');

      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });

      await act(async () => {
        result.current.getToken('test-name', 'test-room');
      });

      expect(window.fetch).toHaveBeenLastCalledWith('/token', {
        body: '{"user_identity":"test-name","room_name":"test-room","passcode":"123123","create_room":true,"create_conversation":false}',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

      // reset the environment variable
      (clientEnv.DISABLE_TWILIO_CONVERSATIONS as jest.Mock).mockReturnValue(undefined);
    });

    it('should return a token', async () => {
      //@ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });

      let token = '';
      await act(async () => {
        token = await result.current.getToken('test-name', 'test-room');
      });
      expect(token).toEqual({ token: 'mockVideoToken' });
    });

    it('should return a useful error message from the serverless function', async () => {
      // @ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        // Return a successful response when the passcode is initially verified
        Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
      );
      window.sessionStorage.setItem('passcode', '123123');
      const { result } = renderHook(usePasscodeAuth, { wrapper });
      await waitFor(() => {
        expect(result.current.isAuthReady).toBe(true);
      });
      // @ts-expect-error: mock browser property
      window.fetch = jest.fn(() =>
        // Return an error when the user tries to join a room
        Promise.resolve({ status: 401, json: () => Promise.resolve({ error: { message: 'passcode expired' } }) })
      );

      result.current.getToken('test-name', 'test-room').catch((err) => {
        expect(err.message).toBe('Passcode has expired');
      });
    });
  });
});

describe('the getPasscode function', () => {
  beforeEach(() => {
    navigate.mockClear();
    window.sessionStorage.clear();
  });

  it('should return the passcode from session storage', () => {
    window.location.search = '';
    window.sessionStorage.setItem('passcode', '123123');
    expect(getPasscode()).toBe('123123');
  });

  it('should return the passcode from the URL', () => {
    const restoreLocation = mockLocationSearch('?passcode=234234');
    expect(getPasscode()).toBe('234234');
    restoreLocation();
  });

  it('should return the passcode from the URL when the app code is also stored in sessionstorage', () => {
    window.sessionStorage.setItem('passcode', '123123');
    const restoreLocation = mockLocationSearch('?passcode=234234');
    expect(getPasscode()).toBe('234234');
    restoreLocation();
  });

  it('should return null when there is no passcode', () => {
    window.location.search = '';
    expect(getPasscode()).toBe(null);
  });
});

describe('the verifyPasscode function', () => {
  it('should return the correct response when the passcode is valid', async () => {
    // @ts-expect-error: mock browser property
    window.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'mockVideoToken' }) })
    );

    const result = await verifyPasscode('123456');
    expect(result).toEqual({ isValid: true });
  });

  it('should return the correct response when the passcode is invalid', async () => {
    // @ts-expect-error: mock browser property
    window.fetch = jest.fn(() =>
      Promise.resolve({ status: 401, json: () => Promise.resolve({ error: { message: 'errorMessage' } }) })
    );

    const result = await verifyPasscode('123456');
    expect(result).toEqual({ isValid: false, error: 'errorMessage' });
  });

  it('should call the API with the correct parameters', async () => {
    await verifyPasscode('123456');
    expect(window.fetch).toHaveBeenLastCalledWith('/token', {
      body: '{"user_identity":"temp-name","room_name":"temp-room","passcode":"123456","create_room":false,"create_conversation":false}',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
  });
});
