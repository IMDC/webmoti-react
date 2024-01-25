import { useEffect, useState } from 'react';

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

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function RaiseHandButton() {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();
  const { sendSystemMsg } = useWebmotiVideoContext();
  const [handQueue, setHandQueue] = useState<string[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null); // the anchor is used so the popover knows where to appear on the screen
  const [countdown, setCountdown] = useState(0); // Add countdown state
  const [buttonIntervalID, setButtonIntervalID] = useState<NodeJS.Timeout | null>(null); // Add button interval ID state

  const theme = useTheme();
  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const url = 'https://y24khent.connect.remote.it/raisehand';

  const raiseHand = async () => {
    // get participant name for raise hand msg
    const name = room?.localParticipant?.identity || 'Participant';

    const lowerHand = () => {
      setIsHandRaised(false);
      setCountdown(0);
      // Clear the button countdown for auto-lowering hand
      if (buttonIntervalID) clearInterval(buttonIntervalID);
      sendSystemMsg(conversation, `${name} lowered hand`);
    };

    // check if in queue
    if (!handQueue.includes(name)) {
      try {
        const response = await fetch(url, { method: 'POST' });

        if (!response.ok) {
          if (response.status === 503) {
            // board not connected to wifi
            alert('Service Offline');
            return;
          }

          // unknown error
          alert(`Unknown error while raising hand: ${response.status}`);
          console.error(`Unknown error while raising hand: ${response.status}`);
          return;
        }

        // success, toggle state for button
        setIsHandRaised(prevState => !prevState);
        // send msg in chat
        sendSystemMsg(conversation, `${name} raised hand`);

        const buttonCountdownDuration = 90;
        // start the countdown timer for the button
        let tempButtonIntervalID = setInterval(() => {
          setCountdown(prevCountdown => {
            if (prevCountdown <= 1) {
              clearInterval(tempButtonIntervalID);
              lowerHand();
              return 0;
            }
            return prevCountdown - 1;
          });
        }, 1000);

        setButtonIntervalID(tempButtonIntervalID);
        setCountdown(buttonCountdownDuration);
      } catch (e) {
        alert(e);
        console.error(e);
        return;
      }
    } else {
      lowerHand();
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
      <Button
        onClick={raiseHand}
        variant="contained"
        color={isHandRaised ? 'secondary' : 'primary'}
        style={{
          position: 'relative',
          height: isHandRaised ? '45px' : '38px',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ minWidth: '80px', lineHeight: '40px' }}>
            {/* Set a fixed width for the content */}
            {isHandRaised ? '' : 'Raise Hand'}
            {countdown > 0 && (
              <span>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={(countdown / 90) * 100}
                    size={30}
                    thickness={6}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  >
                    {countdown}
                  </div>
                </div>
              </span>
            )}
          </span>
        </div>
      </Button>

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
