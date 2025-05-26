import { vi } from "vitest";
import { EventEmitter } from 'events';

class MockRoom extends EventEmitter {
  state = 'connected';
  disconnect = vi.fn();
  localParticipant = {
    publishTrack: vi.fn(),
    videoTracks: [{ setPriority: vi.fn() }],
  };
}

const mockRoom = new MockRoom();

class MockTrack extends EventEmitter {
  kind = '';
  stop = vi.fn();
  mediaStreamTrack = { getSettings: () => ({ deviceId: 'mockDeviceId' }) };

  constructor(kind: string) {
    super();
    this.kind = kind;
  }
}

const twilioVideo = {
  connect: vi.fn(() => Promise.resolve(mockRoom)),
  createLocalTracks: vi.fn(
    // Here we use setTimeout so we can control when this function resolves with jest.runAllTimers()
    () => new Promise(resolve => setTimeout(() => resolve([new MockTrack('video'), new MockTrack('audio')])))
  ),
  createLocalVideoTrack: vi.fn(() => new Promise(resolve => setTimeout(() => resolve(new MockTrack('video'))))),
};

export { mockRoom };
export default twilioVideo;
