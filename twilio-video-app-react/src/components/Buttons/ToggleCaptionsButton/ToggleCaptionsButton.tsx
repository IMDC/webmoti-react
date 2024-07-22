import { useCallback, useEffect, useRef } from 'react';

import { IconButton } from '@material-ui/core';
import { ClosedCaption } from '@material-ui/icons';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { LocalAudioTrack } from 'twilio-video';

import { WS_URL } from '../../../constants';
import useMediaStreamTrack from '../../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';

const isIOS = /iPhone|iPad/.test(navigator.userAgent);

interface AudioToggleDetail {
  enabled: boolean;
}
interface AudioToggleEvent extends CustomEvent<AudioToggleDetail> {}

export default function ToggleCaptionsButton() {
  const { localTracks, room } = useVideoContext();
  const [isAudioEnabled] = useLocalAudioToggle();

  const localAudioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;

  const mediaStreamTrack = useMediaStreamTrack(localAudioTrack);

  const identity = room?.localParticipant?.identity || 'Participant';

  const { displayCaptions, setDisplayCaptions } = useAppState();

  const { sendMessage, readyState, lastJsonMessage } = useWebSocket(`${WS_URL}/stt`, {
    queryParams: { identity },
    share: true,
    shouldReconnect: () => true,
    onClose: () => {
      stopRecording();
      setDisplayCaptions(false);
    },
  });

  const recorderRef = useRef<MediaRecorder | null>(null);

  const strToBytes = (str: string) => {
    const utf8Encode = new TextEncoder();
    return utf8Encode.encode(str);
  };

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    sendMessage(strToBytes('STOPSPEECH'));
  }, [sendMessage]);

  const startRecording = useCallback(() => {
    if (!mediaStreamTrack) {
      console.error('Error getting media stream track');
      return;
    }

    sendMessage(strToBytes('STARTSPEECH'));

    const newMediaStream = new MediaStream([isIOS ? mediaStreamTrack.clone() : mediaStreamTrack]);

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(newMediaStream);

    const options = { mimeType: 'audio/webm; codecs=opus' };
    const recorder = new MediaRecorder(source.mediaStream, options);

    recorder.ondataavailable = (event) => {
      if (readyState === ReadyState.OPEN && event.data.size > 0) {
        sendMessage(event.data);
      }
    };

    recorder.start(100);
    recorderRef.current = recorder;
  }, [mediaStreamTrack, readyState, sendMessage]);

  const toggleCaptions = async () => {
    if (!recorderRef.current && !displayCaptions && !isAudioEnabled) {
      startRecording();
    }

    setDisplayCaptions(!displayCaptions);
  };

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.type === 'start' && !recorderRef.current) {
        startRecording();
      }
    }
  }, [lastJsonMessage, startRecording]);

  useEffect(() => {
    const handleAudioToggle = (event: Event) => {
      const customEvent = event as AudioToggleEvent;
      if (customEvent.detail.enabled) {
        startRecording();
      } else {
        stopRecording();
      }
    };

    window.addEventListener('audiotoggle', handleAudioToggle);

    return () => {
      window.removeEventListener('audiotoggle', handleAudioToggle);
    };
  }, [startRecording, stopRecording]);

  return (
    <IconButton onClick={toggleCaptions}>
      <ClosedCaption color={displayCaptions ? 'primary' : 'inherit'} />
    </IconButton>
  );
}
