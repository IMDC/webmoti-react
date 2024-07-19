import { useCallback, useEffect, useState } from 'react';

import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useWebSocket from 'react-use-websocket';

import { Caption } from './CaptionTypes';
import { WS_URL } from '../../constants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';

const useStyles = makeStyles({
  captionContainer: {
    position: 'fixed',
    left: '15%',
    right: '15%',
    top: 'calc(100% - 300px)',
    zIndex: 100,
  },
  caption: {
    color: 'white',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.2em',
    display: 'inline-block',
  },
});

export function CaptionRenderer() {
  const classes = useStyles();
  const [captions, setCaptions] = useState<Caption[]>([]);

  const { displayCaptions } = useAppState();

  const { room } = useVideoContext();
  const identity = room?.localParticipant?.identity || 'Participant';

  const { lastJsonMessage } = useWebSocket(`${WS_URL}/stt`, {
    queryParams: { identity },
    share: true,
    // shouldReconnect: (closeEvent) => true,
  });

  const registerResult = useCallback((captionResult: Caption) => {
    setCaptions((prevCaptions) => {
      // make a copy of the caption array, keeping only the 4 most recent captions
      const arrayCopy = prevCaptions.slice(-4);

      const existingID = arrayCopy.find((item) => item.captionId === captionResult.captionId);
      if (existingID) {
        // overwrite interim results
        const existingIdIndex = arrayCopy.indexOf(existingID);
        arrayCopy[existingIdIndex] = captionResult;
      } else {
        arrayCopy.push(captionResult);
      }

      return arrayCopy;
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      const caption = lastJsonMessage as Caption;
      registerResult(caption);
    }
  }, [lastJsonMessage, registerResult]);

  // every second, we go through the captions, and remove any that are older than ten seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCaptions((prevCaptions) => {
        const now = Date.now();
        const filteredCaptions = prevCaptions.filter((caption) => caption.timestamp > now - 10000);
        if (filteredCaptions.length !== prevCaptions.length) {
          return filteredCaptions;
        } else {
          return prevCaptions;
        }
      });
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!displayCaptions) return null;

  return (
    <div className={classes.captionContainer}>
      {captions.map((caption) => (
        <div>
          <Typography variant="h6" key={caption.captionId} className={classes.caption}>
            {caption.identity}: {caption.transcript}
          </Typography>
        </div>
      ))}
    </div>
  );
}
