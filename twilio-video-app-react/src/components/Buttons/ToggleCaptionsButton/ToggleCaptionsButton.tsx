import { IconButton } from '@material-ui/core';
import { ClosedCaption } from '@material-ui/icons';
import { LocalAudioTrack } from 'twilio-video';

import useIsTrackEnabled from '../../../hooks/useIsTrackEnabled/useIsTrackEnabled';
import useMediaStreamTrack from '../../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const isIOS = /iPhone|iPad/.test(navigator.userAgent);

export default function ToggleCaptionsButton() {
  const { localTracks } = useVideoContext();

  const localAudioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;

  const isTrackEnabled = useIsTrackEnabled(localAudioTrack);
  const mediaStreamTrack = useMediaStreamTrack(localAudioTrack);

  const toggleCaptions = async () => {
    if (localAudioTrack && mediaStreamTrack && isTrackEnabled) {
      const newMediaStream = new MediaStream([isIOS ? mediaStreamTrack.clone() : mediaStreamTrack]);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(newMediaStream);

      const ws = new WebSocket('ws://localhost:80/api/ws/stt');

      const options = { mimeType: 'audio/webm; codecs=opus' };
      const recorder = new MediaRecorder(source.mediaStream, options);

      recorder.ondataavailable = (event) => {
        if (ws.readyState === WebSocket.OPEN && event.data.size > 0) {
          ws.send(event.data);
        }
      };

      recorder.start(100);

      ws.onclose = () => recorder.stop();
    }
  };

  return (
    <IconButton onClick={toggleCaptions}>
      <ClosedCaption />
    </IconButton>
  );
}
