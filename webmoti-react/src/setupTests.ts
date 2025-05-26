import { vi } from 'vitest';
import 'isomorphic-fetch';
import '@testing-library/jest-dom';

vi.mock('twilio-video', () => import('./__mocks__/twilio-video'));

import { TextEncoder } from 'util';

// fixes error with react-router-dom
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

// mock getScrollbarSize to prevent JSDOM crash in MUI Modal tests.
// MUI uses document.documentElement.clientWidth, which JSDOM doesn't support.
vi.mock('@mui/utils/getScrollbarSize', () => ({
  __esModule: true,
  default: () => 0,
}));

// mock env
vi.mock('./clientEnv', () => ({
  clientEnv: {
    FIREBASE_API_KEY: vi.fn(() => 'mock-firebase-key'),
    FIREBASE_AUTH_DOMAIN: vi.fn(() => 'mock-auth-domain'),
    FIREBASE_STORAGE_BUCKET: vi.fn(() => 'mock-storage-bucket'),
    FIREBASE_MESSAGING_SENDER_ID: vi.fn(() => '1234567890'),

    API_DOMAIN: vi.fn(() => 'mock-api-domain'),
    LIVEKIT_URL: vi.fn(() => 'mock-livekit-url'),

    SET_AUTH: vi.fn(() => 'firebase'),
    DISABLE_TWILIO_CONVERSATIONS: vi.fn(() => undefined),
    TOKEN_ENDPOINT: vi.fn(() => undefined),
    ROOM_TYPE: vi.fn(() => 'go'),

    GIT_TAG: vi.fn(() => 'v0.0'),
    GIT_COMMIT: vi.fn(() => '12345abcde'),
  },
}));

// Mocks the Fullscreen API. This is needed for ToggleFullScreenButton.test.tsx.
Object.defineProperty(document, 'fullscreenEnabled', { value: true, writable: true });

Object.defineProperty(navigator, 'mediaDevices', {
  configurable: true,
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({}),
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getDisplayMedia: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
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
vi.mock('@twilio/video-processors', () => ({}));
