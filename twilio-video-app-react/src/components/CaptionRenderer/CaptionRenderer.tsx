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

interface CaptionMap {
  [identity: string]: Caption[];
}

export function CaptionRenderer() {
  const classes = useStyles();
  const [captions, setCaptions] = useState<CaptionMap>({});

  const { displayCaptions } = useAppState();

  const { room } = useVideoContext();
  const identity = room?.localParticipant?.identity || 'Participant';

  const { lastJsonMessage } = useWebSocket(`${WS_URL}/stt`, {
    queryParams: { identity },
    share: true,
  });

  const registerResult = useCallback((captionResult: Caption) => {
    setCaptions((prevCaptions) => {
      const updatedCaptions = { ...prevCaptions };
      const captionIdentity = captionResult.identity;

      if (!updatedCaptions[captionIdentity]) {
        updatedCaptions[captionIdentity] = [];
      }

      const existingIndex = updatedCaptions[captionIdentity].findIndex(
        (item) => item.captionId === captionResult.captionId
      );
      if (existingIndex !== -1) {
        // overwrite interim results
        updatedCaptions[captionIdentity][existingIndex] = captionResult;
      } else {
        // keep only the 4 most recent captions
        updatedCaptions[captionIdentity] = [...updatedCaptions[captionIdentity], captionResult].slice(-4);
      }

      return updatedCaptions;
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
        const identities = Object.keys(prevCaptions);
        const updatedCaptions: CaptionMap = {};

        identities.forEach(captionIdentity => {
          const filteredCaptions = prevCaptions[captionIdentity].filter(caption => caption.timestamp > now - 10000);
          if (filteredCaptions.length > 0) {
            updatedCaptions[captionIdentity] = filteredCaptions;
          }
        });

        return updatedCaptions;
      });
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!displayCaptions) return null;

  return (
    <div className={classes.captionContainer}>
      {Object.entries(captions).map(([captionIdentity, captionsArray]) => (
        <div key={captionIdentity}>
          <Typography variant="h6" className={classes.caption}>{captionIdentity}:</Typography>
          {captionsArray.map((caption) => (
            <Typography variant="h6" key={caption.captionId} className={classes.caption}>
              {caption.transcript}
            </Typography>
          ))}
        </div>
      ))}
    </div>
  );
}
