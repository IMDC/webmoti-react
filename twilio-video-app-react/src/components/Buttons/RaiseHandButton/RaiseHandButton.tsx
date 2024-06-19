import { useCallback, useEffect, useRef, useState } from 'react';

import { Grid, Theme, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import { EmojiPeople } from '@material-ui/icons';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { Message } from '@twilio/conversations';

import { HandActions } from '../../../constants';
import { MsgTypes } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutIndicator from '../../ShortcutIndicator/ShortcutIndicator';

const maxQueueDisplay = 5;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    firstInQueue: {
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
  })
);

export default function RaiseHandButton() {
  const classes = useStyles();

  const { room } = useVideoContext();
  const { conversation } = useChatContext();

  const { sendSystemMsg, isWebmotiVideo, sendHandRequest, checkSystemMsg } = useWebmotiVideoContext();

  const [handQueue, setHandQueue] = useState<string[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const buttonCountdownDuration = 30;
  const [countdown, setCountdown] = useState(0);

  const [buttonIntervalID, setButtonIntervalID] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRaising = useRef(false);

  // this is run when participant joins
  useEffect(() => {
    const initRemoteIt = async () => {
      const name = room?.localParticipant?.identity || 'Participant';
      // don't init remote it if not student
      if (isWebmotiVideo(name)) {
        return;
      }

      // the service can be offline here, it's just to make the initial connection
      const response = await sendHandRequest('INIT', true);

      console.log(`Remote.It init: ${response.status}`);
    };

    initRemoteIt();
    // it should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setHand = useCallback(
    async (mode: HandActions) => {
      isRaising.current = true;
      const name = room?.localParticipant?.identity || 'Participant';

      // send request
      setIsLoading(true);

      const isFirst = handQueue[0] === name;
      // don't alert if not raising hand, unnecessary
      const isSilent = mode !== HandActions.Raise;

      if (handQueue.length === 0 || (handQueue.length === 1 && mode === HandActions.Lower)) {
        // no one in queue or you're the only one in queue lowering your hand
        await sendHandRequest(mode, isSilent);
      } else if (handQueue.length > 1 && isFirst && mode === HandActions.Lower) {
        // you're in first place and lowering hand
        // there are other people in the queue, so don't lower hand, reraise instead
        await sendHandRequest(HandActions.ReRaise, isSilent);
      } else {
        // do nothing here
        // (if the hand is already raised by someone else, leave it)
      }

      setIsLoading(false);

      if (mode === HandActions.Raise && !handQueue.includes(name)) {
        // raise hand
        sendSystemMsg(
          conversation,
          JSON.stringify({
            type: MsgTypes.Hand,
            identity: name,
            action: HandActions.Raise,
          })
        );
        setHandQueue((prevQueue) => [...prevQueue, name]);
      } else if (mode === HandActions.Lower) {
        sendSystemMsg(
          conversation,
          JSON.stringify({
            type: MsgTypes.Hand,
            identity: name,
            action: HandActions.Lower,
          })
        );
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
    [conversation, handQueue, room, sendSystemMsg, sendHandRequest]
  );

  const handleMouseDown = () => {
    if (!isHandRaised) {
      // Start a timeout when the mouse is held down
      const timeoutId = setTimeout(() => {
        setHand(HandActions.Raise); // Only raise hand if held for more than 500ms
      }, 500);
      setButtonIntervalID(timeoutId);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
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

    const handleKeyPress = (event: KeyboardEvent) => {
      // shortcut is r key
      if (event.key === 'r') {
        const raiseMode = isHandRaised ? HandActions.Lower : HandActions.Raise;
        setHand(raiseMode);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isHandRaised, setHand]);

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
  }, [conversation, checkSystemMsg]);

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
                    <EmojiPeople className={classes.centerIcon} />
                    <ArrowRightIcon color="primary" className={classes.centerIcon} />
                  </>
                )}
                <Chip label={participantName} className={idx === 0 ? classes.firstInQueue : ''} />
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
            variant="contained"
            color={isHandRaised ? 'secondary' : 'primary'}
            // countdown > 0 for some time after raising hand
            disabled={isLoading || countdown > 0}
          >
            {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            {isLoading && <CircularProgress size={24} className={classes.progress} />}

            <ShortcutIndicator />

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
