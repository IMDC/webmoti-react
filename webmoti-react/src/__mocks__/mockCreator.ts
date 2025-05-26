import { vi } from "vitest";
export function createMockParticipant(identity = 'mockIdentity', sid = 1, overrides = {}): any {
  return {
    identity,
    sid,
    tracks: new Map(),
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  };
}

export function createMockRoom(name = 'mockRoom', localParticipant: any = null): any {
  return {
    name,
    localParticipant,
    participants: new Map(),
    on: vi.fn(),
    off: vi.fn(),
  };
}

export function createMockLocalTrack(
  kind: 'audio' | 'video',
  name = kind === 'video' ? 'camera' : 'microphone',
  overrides = {}
): any {
  return {
    kind,
    name,
    mediaStreamTrack: {
      label: `mock local ${kind} track`,
      getSettings: () => ({ deviceId: 'mock-device-id' }),
    },
    restart: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  };
}

export function createMockConversation(): any {
  return {
    on: vi.fn(),
    off: vi.fn(),
  };
}

export function createMockPublication(
  kind: 'audio' | 'video' = 'video',
  trackName = '',
  isSubscribed = true,
  trackSid = 'mockTrackSid',
  overrides = {}
): any {
  return {
    trackName,
    kind,
    isSubscribed,
    track: { sid: trackSid },
    on: vi.fn(),
    off: vi.fn(),
    ...overrides,
  };
}
