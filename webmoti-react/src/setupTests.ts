import 'isomorphic-fetch';
import '@testing-library/jest-dom';

import { TextEncoder } from 'util';

// fixes error with react-router-dom
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

// mock env
jest.mock('./clientEnv', () => ({
  clientEnv: {
    FIREBASE_API_KEY: jest.fn(() => 'mock-firebase-key'),
    FIREBASE_AUTH_DOMAIN: jest.fn(() => 'mock-auth-domain'),
    FIREBASE_STORAGE_BUCKET: jest.fn(() => 'mock-storage-bucket'),
    FIREBASE_MESSAGING_SENDER_ID: jest.fn(() => '1234567890'),

    API_DOMAIN: jest.fn(() => 'mock-api-domain'),
    LIVEKIT_URL: jest.fn(() => 'mock-livekit-url'),

    SET_AUTH: jest.fn(() => 'firebase'),
    DISABLE_TWILIO_CONVERSATIONS: jest.fn(() => undefined),
    TOKEN_ENDPOINT: jest.fn(() => undefined),
    ROOM_TYPE: jest.fn(() => 'go'),

    GIT_TAG: jest.fn(() => 'v0.0'),
    GIT_COMMIT: jest.fn(() => '12345abcde'),
  },
}));

// Mocks the Fullscreen API. This is needed for ToggleFullScreenButton.test.tsx.
Object.defineProperty(document, 'fullscreenEnabled', { value: true, writable: true });

class LocalStorage {
  store = {} as { [key: string]: string };

  getItem(key: string) {
    return this.store[key] ? this.store[key] : null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  clear() {
    this.store = {} as { [key: string]: string };
  }
}

Object.defineProperty(window, 'localStorage', { value: new LocalStorage() });

// This is to suppress the "Platform browser has already been set." warnings from the video-processors library
jest.mock('@twilio/video-processors', () => ({}));
