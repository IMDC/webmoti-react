import { useCallback, useEffect, useState } from 'react';

import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import { useTheme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import { JSONObject, Message } from '@twilio/conversations';

import { Tooltip } from '@material-ui/core';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function RaiseHandButton() {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();
  const { sendSystemMsg } = useWebmotiVideoContext();
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

  const url = 'https://jmn2f42hjgfv.connect.remote.it/raisehand';

  const toggleHand = useCallback(async () => {
    const name = room?.localParticipant?.identity || 'Participant';
    const mode = isHandRaised ? 'LOWER' : 'RAISE';
    setIsLoading(true);

    if (mode === 'RAISE' && !handQueue.includes(name)) {
      // raise hand
      sendSystemMsg(conversation, `${name} raised hand`);
      setHandQueue(prevQueue => [...prevQueue, name]);

      // send request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ mode }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          // board not connected to wifi
          alert('Service Offline.');
        } else {
          alert(`Unknown error while raising hand: ${response.status}: ${response.statusText}`);
        }
      }
    } else if (mode === 'LOWER') {
      sendSystemMsg(conversation, `${name} lowered hand`);
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

    setIsLoading(false);
    setIsHandRaised(!isHandRaised);
  }, [conversation, handQueue, isHandRaised, room, sendSystemMsg]);

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

    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
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
      // parse attributes
      let isSystemMsg = false;
      const attrObj = message.attributes as JSONObject;
      if (attrObj.attributes !== undefined) {
        const attrSysMsg = JSON.parse(attrObj.attributes as string).systemMsg;
        if (attrSysMsg !== undefined) {
          isSystemMsg = true;
        }
      }

      if (isSystemMsg) {
        const match = message.body?.match(/^(.+) (raised|lowered) hand$/);

        if (match) {
          const [, name, action] = match;

          if (message.author === name) {
            setHandQueue((prevQueue: string[]) => {
              if (action === 'raised' && !prevQueue.includes(name)) {
                return [...prevQueue, name];
              } else if (action === 'lowered') {
                return prevQueue.filter(e => e !== name);
              }
              return prevQueue;
            });

            // delete hand msg so it's not shown when rejoining
            message.remove();
          }
        }
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation]);

  return (
    <div>
      {/* main raise hand button */}
      <Tooltip title={isHandRaised ? 'Release to lower hand' : 'Click & hold to raise hand'}>
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
      </Tooltip>

      {/* indicator that shows how many hands are raised */}
      <Badge badgeContent={handQueue.length} color="secondary">
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
