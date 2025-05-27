import '@testing-library/jest-dom';

import { TextEncoder } from 'util';

// fixes error with react-router-dom
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

// mock getScrollbarSize to prevent JSDOM crash in MUI Modal tests.
// MUI uses document.documentElement.clientWidth, which JSDOM doesn't support.
jest.mock('@mui/utils/getScrollbarSize', () => ({
  __esModule: true,
  default: () => 0,
}));

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


Object.defineProperty(navigator, 'mediaDevices', {
  configurable: true,
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
    enumerateDevices: jest.fn().mockResolvedValue([]),
    getDisplayMedia: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});


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
