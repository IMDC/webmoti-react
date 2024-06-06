import { useCallback, useEffect, useState } from 'react';

import { Tooltip } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import { useTheme } from '@material-ui/core/styles';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Message } from '@twilio/conversations';

import { HandActions } from '../../../constants';
import { MsgTypes } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function RaiseHandButton() {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();
  const { sendSystemMsg, isWebmotiVideo, sendHandRequest, checkSystemMsg } = useWebmotiVideoContext();
  const [handQueue, setHandQueue] = useState<string[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  // the anchor is used so the popover knows where to appear on the screen
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const buttonCountdownDuration = 30;
  const [countdown, setCountdown] = useState(0);

  const [buttonIntervalID, setButtonIntervalID] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

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

  const toggleHand = useCallback(async () => {
    const name = room?.localParticipant?.identity || 'Participant';
    const mode = isHandRaised ? HandActions.Lower : HandActions.Raise;

    // send request
    setIsLoading(true);

    const isFirst = handQueue[0] === name;

    if (handQueue.length === 0 || (handQueue.length === 1 && mode === HandActions.Lower)) {
      // no one in queue or you're the only one in queue lowering your hand
      await sendHandRequest(mode);
    } else if (handQueue.length > 1 && isFirst && mode === HandActions.Lower) {
      // you're in first place and lowering hand
      // there are other people in the queue, so don't lower hand, reraise instead
      await sendHandRequest(HandActions.ReRaise);
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
      setHandQueue(prevQueue => [...prevQueue, name]);
    } else if (mode === HandActions.Lower) {
      sendSystemMsg(
        conversation,
        JSON.stringify({
          type: MsgTypes.Hand,
          identity: name,
          action: HandActions.Lower,
        })
      );
      setHandQueue(prevQueue => prevQueue.filter(participantName => participantName !== name));

      // start countdown timer for hand
      setCountdown(buttonCountdownDuration);
      const intervalId = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    setIsHandRaised(!isHandRaised);
  }, [conversation, handQueue, isHandRaised, room, sendSystemMsg, sendHandRequest]);

  const handleMouseDown = () => {
    if (!isHandRaised) {
      // Start a timeout when the mouse is held down
      const timeoutId = setTimeout(() => {
        toggleHand(); // Only raise hand if held for more than 500ms
      }, 500);
      setButtonIntervalID(timeoutId);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isHandRaised) {
        toggleHand();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      // shortcut is r key
      if (event.key === 'r') {
        toggleHand();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isHandRaised, toggleHand]);

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
          return prevQueue.filter(e => e !== msgData.identity);
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
            {isLoading && (
              <CircularProgress
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }}
              />
            )}

            {countdown > 0 && (
              <CircularProgress
                variant="determinate"
                value={(countdown / buttonCountdownDuration) * 100}
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }}
              />
            )}
          </Button>
        </span>
      </Tooltip>

      {/* indicator that shows how many hands are raised */}
      {/* need to set overlap to avoid warning */}
      <Badge badgeContent={handQueue.length} overlap="rectangular" color="secondary">
        {/* hand icon button, click to open queue */}
        <Button onClick={handleOpenPopover} color="default">
          Hands Raised <ExpandMoreIcon />
        </Button>
      </Badge>

      {/* hand queue popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box display="flex" flexWrap="wrap" p={1}>
          {/* for each raised hand, display in queue */}
          {handQueue.map((participantName, idx) => (
            <Box key={idx} m={0.5}>
              {idx === 0 && <ArrowRightIcon color="primary" style={{ marginRight: '5px', verticalAlign: 'middle' }} />}
              <Chip
                label={participantName}
                style={
                  idx === 0 ? { backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 'bold' } : {}
                }
              />
            </Box>
          ))}
        </Box>
      </Popover>
    </div>
  );
}
