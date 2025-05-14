import { useCallback, useEffect, useRef, useState } from 'react';

import { styled } from '@mui/material/styles';

import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import { IconButton } from '@mui/material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useWebSocket from 'react-use-websocket';

import { WS_SERVER_URL } from '../../../constants';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import Snackbar from '../../Snackbar/Snackbar';

const PREFIX = 'ToggleCaptionsButton';

const classes = {
  iconButton: `${PREFIX}-iconButton`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.iconButton}`]: {
    padding: 10,
    marginRight: 10,

    [theme.breakpoints.down('md')]: {
      marginRight: 0,
    },
  },
}));

interface AudioToggleDetail {
  enabled: boolean;
}
interface AudioToggleEvent extends CustomEvent<AudioToggleDetail> {}

export default function ToggleCaptionsButton() {
  const { room } = useVideoContext();
  const [isAudioEnabled] = useLocalAudioToggle();

  const [snackbarError, setSnackbarError] = useState('');

  const { resetTranscript, browserSupportsSpeechRecognition, finalTranscript, interimTranscript } =
    useSpeechRecognition();

  const identity = room?.localParticipant?.identity || 'Participant';

  const captionIdRef = useRef(0);

  const { displayCaptions, setDisplayCaptions } = useAppState();

  const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${WS_SERVER_URL}/captions`, {
    queryParams: { identity },
    share: true,
    shouldReconnect: () => true,
    onClose: async () => {
      setDisplayCaptions(false);
      await stopRecordingCaptions();
    },
    onError: async () => {
      // suppress error messages
    },
  });

  const startRecordingCaptions = useCallback(async () => {
    if (!isAudioEnabled) {
      // no error message since being muted while seeing captions is ok
      return;
    }
    if (!browserSupportsSpeechRecognition) {
      setSnackbarError("Browser is not supported. You will still be able to see other people's captions.");
      return;
    }

    await SpeechRecognition.startListening({ continuous: true, language: 'en-US', interimResults: true });
  }, [isAudioEnabled, browserSupportsSpeechRecognition]);

  const stopRecordingCaptions = async () => {
    await SpeechRecognition.abortListening();
  };

  // react to websocket messages
  useEffect(() => {
    if (lastJsonMessage === null) {
      return;
    }

    const handleMsg = async () => {
      switch (lastJsonMessage.type) {
        case 'start_recording':
          await startRecordingCaptions();
          break;

        case 'stop_recording':
          await stopRecordingCaptions();
          break;
      }
    };

    handleMsg();
  }, [lastJsonMessage, startRecordingCaptions]);

  // when muting/unmuting, also need to toggle recorder
  useEffect(() => {
    const handleAudioToggle = (event: Event) => {
      const customEvent = event as AudioToggleEvent;
      if (customEvent.detail.enabled) {
        startRecordingCaptions();
      } else {
        stopRecordingCaptions();
      }
    };
    window.addEventListener('audiotoggle', handleAudioToggle);
    return () => {
      window.removeEventListener('audiotoggle', handleAudioToggle);
    };
  }, [startRecordingCaptions]);

  const sendCaption = useCallback(
    (caption: string, isFinal: boolean) => {
      sendJsonMessage({
        type: 'caption',
        transcript: caption,
        id: captionIdRef.current,
      });

      if (isFinal) {
        // update caption id
        captionIdRef.current += 1;
      }
    },
    [sendJsonMessage]
  );

  useEffect(() => {
    if (!interimTranscript && finalTranscript) {
      // caption isFinal when interimTranscript is empty
      sendCaption(finalTranscript, true);
      // clear old final caption
      resetTranscript();
    } else if (interimTranscript) {
      // send interim transcript (not complete)
      sendCaption(interimTranscript, false);
    }
  }, [interimTranscript, finalTranscript, resetTranscript, sendCaption]);

  const toggleCaptions = () => {
    if (!displayCaptions) {
      setDisplayCaptions(true);
      sendJsonMessage({ type: 'caption_action', action: 'start' });
    } else {
      setDisplayCaptions(false);
      sendJsonMessage({ type: 'caption_action', action: 'stop' });
    }
  };

  return (
    <Root>
      <Snackbar
        variant="error"
        headline="Captions Error"
        message={snackbarError}
        open={snackbarError !== ''}
        handleClose={() => {
          setSnackbarError('');
        }}
      />
      <IconButton onClick={toggleCaptions} className={classes.iconButton} size="large">
        <ClosedCaptionIcon color={displayCaptions ? 'primary' : 'inherit'} />
      </IconButton>
    </Root>
  );
}
