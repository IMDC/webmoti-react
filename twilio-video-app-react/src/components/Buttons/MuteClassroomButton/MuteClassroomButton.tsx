import Button from '@material-ui/core/Button';

import { RemoteAudioTrack, RemoteTrack } from 'twilio-video';

import { WEBMOTI_CAMERA_1 } from '../../../constants';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

import { useState } from 'react';

export default function ToggleCameraButton() {
  const { room } = useVideoContext();
  const [isMuted, setIsMuted] = useState(false);

  function isRemoteAudioTrack(track: RemoteTrack): track is RemoteAudioTrack {
    return track.kind === 'audio' && 'attach' in track;
  }

  const toggleMute = () => {
    // get classroom participant
    let classroom = null;
    if (room && room.participants) {
      for (const participant of room.participants.values()) {
        if (participant.identity === WEBMOTI_CAMERA_1) {
          classroom = participant;
          break;
        }
      }
    }

    if (classroom) {
      const audioTracks = Array.from(classroom.tracks.values())
        .filter(trackPublication => trackPublication.track !== null && trackPublication.track.kind === 'audio')
        .map(trackPublication => trackPublication.track!);

      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0];

        if (isRemoteAudioTrack(audioTrack)) {
          // track.detach returns all attached elements, but also detaches them
          const attachedElements = audioTrack.detach();

          // mute all elements
          attachedElements.forEach(el => {
            el.muted = !isMuted;
          });

          // attach the track back after changing muted state
          attachedElements.forEach(el => audioTrack.attach(el));

          setIsMuted(!isMuted);
        }
      }
    }
  };

  return <Button onClick={() => toggleMute()}>{isMuted ? 'Unmute Classroom' : 'Mute Classroom'}</Button>;
}
