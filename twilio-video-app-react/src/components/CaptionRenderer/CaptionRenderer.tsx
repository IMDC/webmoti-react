import { useCallback, useEffect, useState } from 'react';

import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useWebSocket from 'react-use-websocket';

import { Caption } from './CaptionTypes';
import { WS_URL } from '../../constants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';

const useStyles = makeStyles((theme: Theme) => ({
  captionContainer: {
    position: 'fixed',
    left: '20%',
    right: '15%',
    bottom: `${theme.footerHeight}px`,
    zIndex: 100,
    overflow: 'hidden',
    maxHeight: '12em',
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  caption: {
    color: 'white',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.2em',
    display: 'inline-block',
  },
}));

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
        updatedCaptions[captionIdentity] = [...updatedCaptions[captionIdentity], captionResult].slice(-15);
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

  // every second check captions to see if any are older than ten seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCaptions((prevCaptions) => {
        const now = Date.now();
        const identities = Object.keys(prevCaptions);
        const updatedCaptions: CaptionMap = {};

        for (const captionIdentity of identities) {
          const captionSet = prevCaptions[captionIdentity];
          // only include if most recent caption is newer than 10 seconds
          if (captionSet[captionSet.length - 1].timestamp > now - 10000) {
            updatedCaptions[captionIdentity] = captionSet;
          }
        }

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
          <Typography variant="h6" className={classes.caption}>
            {captionIdentity}:
          </Typography>
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
