import { useEffect, useState } from 'react';

import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import { useTheme } from '@material-ui/core/styles';

import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import { Message } from '@twilio/conversations';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { kMaxLength } from 'buffer';

export default function RaiseHandButton() {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();
  const [handQueue, setHandQueue] = useState<string[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [handTimeoutID, setHandTimeoutID] = useState<number | null>(null); // timeout id for auto lowering hand
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null); // the anchor is used so the popover knows where to appear on the screen
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // Add countdown state

  const theme = useTheme();
  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const raiseHand = () => {
    // get participant name for raise hand msg
    const name = room?.localParticipant?.identity || 'Participant';
    // toggle state for button
    setIsHandRaised(prevState => !prevState);

    const autoLowerHand = () => {
      setIsHandRaised(false);
      conversation?.sendMessage(`${name} lowered hand`);
    };

    // check if in queue
    if (!handQueue.includes(name)) {
      // send msg in chat
      conversation?.sendMessage(`${name} raised hand`);

      // set dimensions and position of new window for raise hand page
      const width = window.screen.width / 3;
      const height = window.screen.height / 10;
      const left = (window.screen.width - width) / 2;
      const top = window.screen.height - 4 * height;

      // open new window with raise hand page
      const newTab = window.open(
        'https://y24khent.connect.remote.it/raisehand',
        '_blank',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (newTab) {
        setIsLoading(true);
    
        // Set the countdown duration for the tab (e.g., 4 seconds)
        let tabCountdownDuration = 4;
    
        // Start the countdown timer for the tab
        const tabIntervalID = setInterval(() => {
          if (tabCountdownDuration <= 1) {
            clearInterval(tabIntervalID);
            newTab.close(); // Close the tab after 4 seconds
          }
          tabCountdownDuration -= 1;
        }, 1000);
    
        // Set the countdown duration for the button (e.g., 30 seconds)
        const buttonCountdownDuration = 30;
    
        // Start the countdown timer for the button
        const buttonIntervalID = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown <= 1) {
              clearInterval(buttonIntervalID);
              autoLowerHand();
              return 0;
            }
            return prevCountdown - 1;
          });
        }, 1000);
    
        setCountdown(buttonCountdownDuration);
    
        window.setTimeout(() => {
          setIsLoading(false);
          clearInterval(buttonIntervalID);
          autoLowerHand();
        }, buttonCountdownDuration * 1000);
      }
    } else {
      conversation?.sendMessage(`${name} lowered hand`);
      clearTimeout((handTimeoutID as unknown) as number); // Remove auto lower hand timeout
    }
  };

  // listen for raise hand msg and update queue
  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
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
        disabled={isLoading}
        style={{ position: 'relative' }}
      >
        {isLoading && (
          <CircularProgress size={20} style={{ position: 'absolute'}} />
        )}
        {isHandRaised ? <span style={{ color: 'disabled' }}></span> : 'Raise Hand'}
        {countdown > 0 && <span> ({countdown} sec)</span>}
      </Button>

      {/* indicator that shows how many hands are raised */}
      <Badge badgeContent={handQueue.length} color="secondary">
        {/* hand icon button, click to open queue */}
        <Button onClick={handleOpenPopover} color="default">
          Hands Raised
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
