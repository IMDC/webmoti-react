import { useCallback, useEffect, useState } from 'react';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { RecordingRules } from '../../types';
import {
  DISABLE_TWILIO_CONVERSATIONS,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_STORAGE_BUCKET,
  TOKEN_ENDPOINT,
} from '../../clientEnv';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
};

const getUrlTokenParam = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    // remove token from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());
  }

  return token;
};

export type RaspberryPiUser = {
  token: string;
  displayName?: string;
  photoURL?: undefined;
};

function isRaspberryPiUser(user: AuthUser): user is RaspberryPiUser {
  // normal users don't have a "token" property
  return !!user && typeof (user as RaspberryPiUser).token === 'string';
}

type AuthUser = User | RaspberryPiUser | null;

export default function useFirebaseAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const getToken = useCallback(
    async (user_identity: string, room_name: string) => {
      // just return token from url if raspberry pi
      if (isRaspberryPiUser(user)) {
        return { token: user.token };
      }

      const headers = new window.Headers();

      const idToken = await user!.getIdToken();
      headers.set('Authorization', `Bearer ${idToken}`);
      headers.set('content-type', 'application/json');

      const endpoint = TOKEN_ENDPOINT || '/token';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_identity,
          room_name,
          create_conversation: DISABLE_TWILIO_CONVERSATIONS !== 'true',
        }),
      });

      const responseText = await response.text();

      let responseBody;
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }

      if (!response.ok) {
        let formattedError = typeof responseBody === 'object' ? JSON.stringify(responseBody) : responseBody;

        throw new Error(`Request failed with status ${response.status}: ${formattedError}`);
      }

      return responseBody;
    },
    [user]
  );

  const updateRecordingRules = useCallback(
    async (room_sid: string, rules: RecordingRules) => {
      const headers = new window.Headers();

      if (isRaspberryPiUser(user)) {
        console.error('Raspberry PI user cannot sign in to firebase');
        return;
      }

      const idToken = await user!.getIdToken();
      headers.set('Authorization', idToken);
      headers.set('content-type', 'application/json');

      return fetch('/recordingrules', {
        method: 'POST',
        headers,
        body: JSON.stringify({ room_sid, rules }),
      }).then(async (res) => {
        const jsonResponse = await res.json();

        if (!res.ok) {
          const recordingError = new Error(
            jsonResponse.error?.message || 'There was an error updating recording rules'
          );
          recordingError.code = jsonResponse.error?.code;
          return Promise.reject(recordingError);
        }

        return jsonResponse;
      });
    },
    [user]
  );

  useEffect(() => {
    // initialize firebase
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }

    // check for token parameter in url
    const token = getUrlTokenParam();
    if (token) {
      // minimal pi user object
      const piUser: RaspberryPiUser = {
        token: token,
      };

      setUser(piUser);
      setIsAuthReady(true);
    } else {
      // normal user scenario
      const unsubscribe = getAuth().onAuthStateChanged((newUser) => {
        setUser(newUser);
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    }
  }, []);

  const signIn = useCallback(() => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');

    return signInWithPopup(getAuth(), provider)
      .then((newUser) => {
        setUser(newUser.user);
      })
      .catch((error) => {
        console.error('Sign-in error:', error.code, error.message);
      });
  }, []);

  const signOut = useCallback(() => {
    return getAuth()
      .signOut()
      .then(() => {
        setUser(null);
      });
  }, []);

  return { user, signIn, signOut, isAuthReady, getToken, updateRecordingRules };
}
