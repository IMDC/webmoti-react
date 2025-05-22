import { Button, CircularProgress } from '@mui/material';
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent, Track } from 'livekit-client';
import { useState } from 'react';
import { HTTPS_SERVER_URL } from '../../../constants';
import { clientEnv } from '../../../clientEnv';

const room = new Room({
  adaptiveStream: false,
  publishDefaults: {
    audioPreset: {
      maxBitrate: 64000,
      priority: 'medium',
    },
    dtx: true,
    red: true,
  },
});

let token: string;

export default function LivekitConnectButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function getToken(id: string) {
    setIsLoading(true);
    const response = await fetch(`${HTTPS_SERVER_URL}/get-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setIsLoading(false);

    if (!response.ok) {
      console.error('Failed to fetch token');
      alert('Failed to fetch token');
      return null;
    }

    const data = await response.json();
    return data.token;
  }

  function handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    if (track.kind === Track.Kind.Audio) {
      console.log(`Subscribed to audio track from ${participant.identity}`);

      // attach audio track and append it to the document body
      const element = track.attach();
      element.style.display = 'none';
      document.body.appendChild(element);
    }
  }

  function handleTrackUnsubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    if (track.kind === Track.Kind.Audio) {
      console.log(`Unsubscribed from audio track of ${participant.identity}`);

      // detach and remove the audio element
      const elements = track.detach();
      elements.forEach((el) => el.remove());
    }
  }

  function handleDisconnect() {
    console.log('Disconnected from classroom');
    setIsConnected(false);
  }

  async function connect() {
    if (!clientEnv.LIVEKIT_URL()) {
      alert('Livekit URL not set');
      return;
    }

    try {
      if (!isConnected) {
        console.log('Preparing connection...');
        const userId = crypto.randomUUID();
        token = await getToken(userId);

        if (!token) {
          alert('Error authenticating');
          return;
        }

        room
          .on(RoomEvent.Disconnected, handleDisconnect)
          .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
          .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

        console.log('Connecting to room...');
        await room.connect(clientEnv.LIVEKIT_URL()!, token);
        setIsConnected(true);
        console.log('Connected to LiveKit room!');
      } else {
        room.disconnect();
        setIsConnected(false);
        console.log('Disconnected from LiveKit room.');
      }
    } catch (error) {
      console.error('Error during connection:', error);
      alert('An error occurred. Check console for details.');
    }
  }

  return (
    <Button
      variant="contained"
      color={isConnected ? 'secondary' : 'primary'}
      onClick={connect}
      style={{ marginLeft: '10px' }}
    >
      {isConnected ? 'Mute Students' : 'Hear Students'}
      {isLoading && <CircularProgress size={24} />}
    </Button>
  );
}
