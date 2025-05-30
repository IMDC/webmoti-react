import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RecordingRules } from '../../types';
import { clientEnv } from '../../clientEnv';

const endpoint = clientEnv.TOKEN_ENDPOINT() || '/token';

export function getPasscode() {
  const match = window.location.search.match(/passcode=(.*)&?/);
  const passcode = match ? match[1] : window.sessionStorage.getItem('passcode');
  return passcode;
}

export function fetchToken(
  name: string,
  room: string,
  passcode: string,
  create_room = true,
  create_conversation = clientEnv.DISABLE_TWILIO_CONVERSATIONS() !== 'true'
) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      user_identity: name,
      room_name: room,
      passcode,
      create_room,
      create_conversation,
    }),
  });
}

export function verifyPasscode(passcode: string) {
  return fetchToken('temp-name', 'temp-room', passcode, false /* create_room */, false /* create_conversation */).then(
    async (res) => {
      const jsonResponse = await res.json();
      if (res.status === 401) {
        return { isValid: false, error: jsonResponse.error?.message };
      }

      if (res.ok && jsonResponse.token) {
        return { isValid: true };
      }
    }
  );
}

export function getErrorMessage(message: string) {
  switch (message) {
    case 'passcode incorrect':
      return 'Passcode is incorrect';
    case 'passcode expired':
      return 'Passcode has expired';
    default:
      return message;
  }
}

export default function usePasscodeAuth() {
  const navigate = useNavigate();

  const [user, setUser] = useState<{ displayName: undefined; photoURL: undefined; passcode: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const getToken = useCallback(
    (name: string, room: string) => {
      return fetchToken(name, room, user!.passcode)
        .then(async (res) => {
          if (res.ok) {
            return res;
          }
          const json = await res.json();
          const errorMessage = getErrorMessage(json.error?.message || res.statusText);
          throw Error(errorMessage);
        })
        .then((res) => res.json());
    },
    [user]
  );

  const updateRecordingRules = useCallback(
    async (room_sid: string, rules: RecordingRules) => {
      return fetch('/recordingrules', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_sid, rules, passcode: user?.passcode }),
        method: 'POST',
      }).then(async (res) => {
        const jsonResponse = await res.json();

        if (!res.ok) {
          const error = new Error(jsonResponse.error?.message || 'There was an error updating recording rules');
          error.code = jsonResponse.error?.code;

          return Promise.reject(error);
        }

        return jsonResponse;
      });
    },
    [user]
  );

  useEffect(() => {
    const passcode = getPasscode();

    if (passcode) {
      verifyPasscode(passcode)
        .then((verification) => {
          if (verification?.isValid) {
            setUser({ passcode, displayName: undefined, photoURL: undefined });
            window.sessionStorage.setItem('passcode', passcode);
            navigate(window.location.pathname, { replace: true });
          }
        })
        .then(() => setIsAuthReady(true));
    } else {
      setIsAuthReady(true);
    }
  }, [navigate]);

  const signIn = useCallback((passcode: string) => {
    return verifyPasscode(passcode).then((verification) => {
      if (verification?.isValid) {
        setUser({ passcode, displayName: undefined, photoURL: undefined });
        window.sessionStorage.setItem('passcode', passcode);
      } else {
        throw new Error(getErrorMessage(verification?.error));
      }
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.sessionStorage.removeItem('passcode');
    return Promise.resolve();
  }, []);

  return { user, isAuthReady, getToken, signIn, signOut, updateRecordingRules };
}
