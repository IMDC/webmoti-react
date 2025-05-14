import { useCallback, useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';

import { Typography, Theme } from '@mui/material';
import useWebSocket from 'react-use-websocket';

import { Caption } from './CaptionTypes';
import { WS_SERVER_URL } from '../../constants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import Snackbar from '../Snackbar/Snackbar';

const PREFIX = 'CaptionRenderer';

const classes = {
  captionContainer: `${PREFIX}-captionContainer`,
  caption: `${PREFIX}-caption`
};

const Root = styled('div')((
  {
    theme: Theme
  }
) => ({
  [`&.${classes.captionContainer}`]: {
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

  [`& .${classes.caption}`]: {
    color: 'white',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.2em',
    display: 'inline-block',
  }
}));

interface CaptionMap {
  [identity: string]: Caption[];
}

export function CaptionRenderer() {

  const [captions, setCaptions] = useState<CaptionMap>({});

  const { displayCaptions } = useAppState();

  const { room } = useVideoContext();
  const identity = room?.localParticipant?.identity || 'Participant';

  const [error, setError] = useState(false);

  const { lastJsonMessage } = useWebSocket(`${WS_SERVER_URL}/captions`, {
    queryParams: { identity },
    share: true,
    onError: () => {
      setError(true);
    },
  });

  const registerResult = useCallback((caption: Caption) => {
    setCaptions((prevCaptions) => {
      const updatedCaptions = { ...prevCaptions };

      let captionsArray = updatedCaptions[caption.identity] || [];

      const existingIndex = captionsArray.findIndex((item) => item.captionId === caption.captionId);

      if (existingIndex !== -1) {
        // overwrite interim results
        captionsArray[existingIndex] = caption;
      } else {
        captionsArray = [...captionsArray, caption];

        // only keep 15 last captions when there are over 30
        if (captionsArray.length > 30) {
          captionsArray = captionsArray.slice(-15);
        }
      }

      updatedCaptions[caption.identity] = captionsArray;
      return updatedCaptions;
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage !== null && lastJsonMessage.type === 'caption') {
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
    <Root className={classes.captionContainer}>
      <Snackbar
        variant="error"
        headline="Captions Error"
        message="Failed to connect to captions server"
        open={error}
        handleClose={() => {
          setError(false);
        }}
      />
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
    </Root>
  );
}
