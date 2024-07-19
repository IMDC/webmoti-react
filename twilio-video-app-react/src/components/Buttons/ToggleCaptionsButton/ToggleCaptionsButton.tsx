import { useRef } from 'react';

import { IconButton } from '@material-ui/core';
import { ClosedCaption } from '@material-ui/icons';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { LocalAudioTrack } from 'twilio-video';

import { WS_URL } from '../../../constants';
import useIsTrackEnabled from '../../../hooks/useIsTrackEnabled/useIsTrackEnabled';
import useMediaStreamTrack from '../../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';

const isIOS = /iPhone|iPad/.test(navigator.userAgent);

export default function ToggleCaptionsButton() {
  const { localTracks, room } = useVideoContext();

  const localAudioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;

  const isTrackEnabled = useIsTrackEnabled(localAudioTrack);
  const mediaStreamTrack = useMediaStreamTrack(localAudioTrack);

  const identity = room?.localParticipant?.identity || 'Participant';

  const { displayCaptions, setDisplayCaptions } = useAppState();

  const { sendMessage, readyState } = useWebSocket(`${WS_URL}/stt`, {
    queryParams: { identity },
    share: true,
    shouldReconnect: (closeEvent) => displayCaptions,
    onClose: () => {
      stopRecording();
      setDisplayCaptions(false);
    },
  });

  const recorderRef = useRef<MediaRecorder | null>(null);

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
  };

  const toggleCaptions = async () => {
    if (displayCaptions) {
      // stop captions
      stopRecording();
      let utf8Encode = new TextEncoder();
      sendMessage(utf8Encode.encode('ENDCONN'), false);
      setDisplayCaptions(false);
      return;
    }

    if (!(localAudioTrack && mediaStreamTrack && isTrackEnabled)) {
      setDisplayCaptions(false);
      console.error('Error getting media stream track');
      return;
    }

    const newMediaStream = new MediaStream([isIOS ? mediaStreamTrack.clone() : mediaStreamTrack]);

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(newMediaStream);

    // TODO make it detect silence

    const options = { mimeType: 'audio/webm; codecs=opus' };
    const recorder = new MediaRecorder(source.mediaStream, options);

    recorder.ondataavailable = (event) => {
      if (readyState === ReadyState.OPEN && event.data.size > 0) {
        sendMessage(event.data);
      }
    };

    recorder.start(100);
    recorderRef.current = recorder;

    setDisplayCaptions(true);
  };

  return (
    <IconButton onClick={toggleCaptions}>
      <ClosedCaption color={displayCaptions ? 'primary' : 'inherit'} />
    </IconButton>
  );
}
