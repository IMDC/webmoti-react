import { EventEmitter } from 'events';

import { render, screen } from '@testing-library/react';

import { ParticipantAudioTracks } from './ParticipantAudioTracks';
import useParticipants from '../../hooks/useParticipants/useParticipants';

jest.mock('../../hooks/useVideoContext/useVideoContext', () => () => ({
  localTracks: [],
  room: { sid: 'mockRoomSid' },
}));

function MockAudioTrack() {
  return <div data-testid="mock-audio-track">Mock Audio Track</div>;
}

jest.mock('../../hooks/useParticipants/useParticipants');
jest.mock('../AudioTrack/AudioTrack', () => MockAudioTrack);

const mockUseParticipants = useParticipants as jest.Mock<any>;

class MockParticipant extends EventEmitter {
  sid: string;
  tracks: any;

  constructor(tracks: any) {
    super();
    this.sid = Math.random().toString();
    this.tracks = new Map(tracks);
  }
}

mockUseParticipants.mockImplementation(() => [
  new MockParticipant([
    ['audio', { track: { kind: 'audio' } }],
    ['video', { track: { kind: 'video' } }],
  ]),
  new MockParticipant([['audio', { track: { kind: 'audio' } }]]),
  new MockParticipant([['video', { track: { kind: 'video' } }]]), // No MockAudioTracks will be rendered for this participant
]);

describe('the ParticipantAudioTracks component', () => {
  it('should render the audio tracks for all participants', () => {
    render(<ParticipantAudioTracks />);
    expect(screen.getAllByTestId('mock-audio-track')).toHaveLength(2);
  });
});
