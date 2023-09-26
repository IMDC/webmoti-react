import { useEffect, useState } from 'react';

import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Popover from '@material-ui/core/Popover';
import { useTheme } from '@material-ui/core/styles';

import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import HandIcon from '@material-ui/icons/PanTool';

import { Message } from '@twilio/conversations';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export default function RaiseHandButton() {
  const { conversation } = useChatContext();
  const { room } = useVideoContext();
  // get participant name for raise hand msg
  const name = room?.localParticipant?.identity || 'Participant';

  const [handQueue, setHandQueue] = useState<string[]>([]);
  // the anchor is used so the popover knows where to appear on the screen
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const theme = useTheme();
  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const raiseHand = () => {
    conversation?.sendMessage(`${name} raised hand`);

    const newTab = window.open('https://y24khent.connect.remote.it/raisehand', '_blank');

    if (newTab) {
      window.setTimeout(() => {
        newTab.close();
      }, 12000);
    }
  };

  // event listener for added msg
  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (message.body) {
        // check for raise hand msg format
        const match = message.body.match(/^(.+) raised hand$/);

        if (match) {
          const name = match[1];
          setHandQueue((prevQueue: string[]) => {
            // add if not in queue already
            if (!prevQueue.includes(name)) {
              return [...prevQueue, name];
            }
            return prevQueue;
          });
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
      <Button onClick={raiseHand} variant="contained" color="primary">
        Raise Hand
      </Button>

      {/* indicator that shows how many hands are raised */}
      <Badge badgeContent={handQueue.length} color="secondary">
        {/* hand icon button, click to open queue */}
        <Button onClick={handleOpenPopover} color="default">
          <HandIcon />
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
