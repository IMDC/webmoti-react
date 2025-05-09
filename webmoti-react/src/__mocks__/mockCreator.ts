export function createMockParticipant(identity = 'mockIdentity', sid = 1, overrides = {}): any {
  return {
    identity,
    sid,
    tracks: new Map(),
    on: jest.fn(),
    off: jest.fn(),
    ...overrides,
  };
}

export function createMockRoom(name = 'mockRoom', localParticipant: any = null): any {
  return {
    name,
    localParticipant,
    participants: new Map(),
    on: jest.fn(),
    off: jest.fn(),
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
    restart: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    ...overrides,
  };
}

export function createMockConversation(): any {
  return {
    on: jest.fn(),
    off: jest.fn(),
  };
}
