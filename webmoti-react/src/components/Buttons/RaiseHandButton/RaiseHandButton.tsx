import { useCallback, useEffect, useRef, useState } from 'react';

import { makeStyles } from '@mui/styles';
import { useTheme, Theme } from '@mui/material/styles';
import { Button, Box, Chip, CircularProgress, Grid, Tooltip, useMediaQuery } from '@mui/material';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import PanToolIcon from '@mui/icons-material/PanTool';
import { Message } from '@twilio/conversations';

import { Events, HandActions } from '../../../constants';
import { MsgTypes } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useDominantSpeaker from '../../../hooks/useDominantSpeaker/useDominantSpeaker';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { checkSystemMsg, isWebmotiVideo, sendSystemMsg } from '../../../utils';
import ShortcutIndicator from '../../ShortcutIndicator/ShortcutIndicator';

const maxQueueDisplay = 5;

const useStyles = makeStyles((theme: Theme) => ({
  handQueueBanner: {
    position: 'fixed',
    zIndex: 8,
    bottom: `${theme.footerHeight}px`,
    left: 0,
    right: 0,
    height: '104px',
  },
  handQueue: {
    background: 'white',
    borderRadius: '16px',
    padding: theme.spacing(2),
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.9)',
  },
  centerIcon: {
    marginRight: '5px',
    verticalAlign: 'middle',
  },
  queueSpeaker: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    fontWeight: 'bold',
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

export default function RaiseHandButton() {
  const classes = useStyles();

  const { room } = useVideoContext();
  const { conversation } = useChatContext();

  const { sendHandRequest } = useWebmotiVideoContext();

  const [handQueue, setHandQueue] = useState<string[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const buttonCountdownDuration = 30;
  const [countdown, setCountdown] = useState(0);

  const [buttonIntervalID, setButtonIntervalID] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRaising = useRef(false);

  const name = room?.localParticipant?.identity || 'Participant';

  const dominantSpeaker = useDominantSpeaker(true);
  const [isAudioEnabled] = useLocalAudioToggle();

  const [wasShortcutUsed, setWasShortcutUsed] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // avoid double touch events
  const lastTouch = useRef<number | null>(null);

  // this is run when participant joins
  useEffect(() => {
    const initRemoteIt = async () => {
      // don't init remote it if not student
      if (isWebmotiVideo(name)) {
        return;
      }

      // the service can be offline here, it's just to make the initial connection
      const response = await sendHandRequest('INIT', null, true);

      if (process.env.NODE_ENV !== 'test') {
        console.log(`Remote.It init: ${response.status}`);
      }
    };

    initRemoteIt();
    // it should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setHand = useCallback(
    async (mode: HandActions) => {
      isRaising.current = true;

      setIsLoading(true);
      // don't alert if not raising hand, unnecessary
      const isSilent = mode !== HandActions.Raise;
      await sendHandRequest(mode, name, isSilent);
      setIsLoading(false);

      sendSystemMsg(
        conversation,
        JSON.stringify({
          type: MsgTypes.Hand,
          identity: name,
          action: mode,
        })
      );

      if (mode === HandActions.Raise && !handQueue.includes(name)) {
        // put in queue
        setHandQueue((prevQueue) => [...prevQueue, name]);

        // show fireworks
        const event = new CustomEvent(Events.Fireworks);
        document.dispatchEvent(event);
      } else if (mode === HandActions.Lower) {
        // remove from queue
        setHandQueue((prevQueue) => prevQueue.filter((participantName) => participantName !== name));

        // start countdown timer for hand
        setCountdown(buttonCountdownDuration);
        const intervalId = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prevCountdown - 1;
          });
        }, 1000);
      }

      setIsHandRaised(mode === HandActions.Raise);
      isRaising.current = false;
    },
    [conversation, handQueue, sendHandRequest, name]
  );

  const handleMouseDown = (e?: React.MouseEvent | React.TouchEvent) => {
    // some browsers send simulated mouse events along with touch events
    if (e && 'touches' in e && e.touches.length > 0) {
      lastTouch.current = Date.now();
    } else if (lastTouch.current && Date.now() - lastTouch.current < 500) {
      // ignore simulated mouse event
      return;
    }

    if (wasShortcutUsed) {
      setWasShortcutUsed(false);
      setHand(HandActions.Lower);
      return;
    }

    if (!isHandRaised) {
      // Start a timeout when the mouse is held down
      const timeoutId = setTimeout(() => {
        setHand(HandActions.Raise); // Only raise hand if held for more than 500ms
      }, 500);
      setButtonIntervalID(timeoutId);
    }
  };

  useSetupHotkeys('h', () => {
    // if lowering hand with hotkey, set to false, otherwise true
    // this is so that the `if (wasShortcutUsed) {` part in `handleMouseDown`
    // will only trigger if you use the hotkey to raise the hand
    // and this is because with the hotkey, you don't need to hold it down
    setWasShortcutUsed(!isHandRaised);
    const raiseMode = isHandRaised ? HandActions.Lower : HandActions.Raise;
    setHand(raiseMode);
  });

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (wasShortcutUsed) {
        // don't lower hand on mouse down if keyboard shortcut was used
        // because that would be confusing
        return;
      }

      if (isRaising.current) {
        // if mouse is released right after raising hand, it won't lower
        setTimeout(() => {
          // schedule hand lower after a short delay
          setHand(HandActions.Lower);
        }, 500);
      }

      if (isHandRaised) {
        setHand(HandActions.Lower);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isHandRaised, setHand, wasShortcutUsed]);

  const handleMouseUp = () => {
    // Clear the timeout if the mouse is released
    if (buttonIntervalID) {
      clearTimeout(buttonIntervalID);
      setButtonIntervalID(null);
    }
  };

  // listen for raise hand msg and update queue
  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (!checkSystemMsg(message)) {
        return;
      }

      const msgData = JSON.parse(message.body || '');

      if (msgData.type !== MsgTypes.Hand) {
        // not hand msg
        return;
      }

      if (message.author !== msgData.identity) {
        // msg was sent by someone else
        return;
      }

      setHandQueue((prevQueue: string[]) => {
        if (msgData.action === HandActions.Raise && !prevQueue.includes(msgData.identity)) {
          return [...prevQueue, msgData.identity];
        } else if (msgData.action === HandActions.Lower) {
          return prevQueue.filter((e) => e !== msgData.identity);
        }
        return prevQueue;
      });

      // delete hand msg so it's not shown when rejoining
      message.remove();
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation]);

  return (
    <div>
      {/* hand queue */}
      {handQueue.length > 0 && (
        <Grid container justifyContent="center" alignItems="center" className={classes.handQueueBanner}>
          <Box display="flex" flexWrap="wrap" p={1} className={classes.handQueue}>
            {/* for each raised hand up to maxQueueDisplay, display in queue */}
            {handQueue.slice(0, maxQueueDisplay).map((participantName, idx) => (
              <Box key={idx} m={0.5}>
                {idx === 0 && (
                  <>
                    <EmojiPeopleIcon className={classes.centerIcon} />
                    <ArrowRightIcon color="primary" className={classes.centerIcon} />
                  </>
                )}
                {/* dominant speaker is highlighted in the queue */}
                <Chip
                  label={participantName}
                  // dominant speaker isn't set for the local participant
                  // so highlight local participant if unmuted
                  className={
                    (!dominantSpeaker?.identity && isAudioEnabled && participantName === name) ||
                    dominantSpeaker?.identity === participantName
                      ? classes.queueSpeaker
                      : ''
                  }
                />
              </Box>
            ))}

            {/* if more participants, show how many more */}
            {handQueue.length > maxQueueDisplay && (
              <Box m={0.5}>
                <Chip label={`+${handQueue.length - maxQueueDisplay} more`} />
              </Box>
            )}
          </Box>
        </Grid>
      )}

      {/* main raise hand button */}
      <Tooltip title={isHandRaised ? 'Release to lower hand' : 'Click & hold to raise hand'}>
        <span>
          <Button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            variant="contained"
            color={isHandRaised ? 'secondary' : 'primary'}
            // countdown > 0 for some time after raising hand
            disabled={isLoading || countdown > 0}
          >
            {isMobile ? <PanToolIcon /> : isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            {isLoading && <CircularProgress size={24} className={classes.progress} />}

            {!isMobile && <ShortcutIndicator shortcut="H" />}

            {countdown > 0 && (
              <CircularProgress
                variant="determinate"
                value={(countdown / buttonCountdownDuration) * 100}
                size={24}
                className={classes.progress}
              />
            )}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
