import { useEffect, useState } from 'react';

import { Button, Popover } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import { JSONObject, Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1 } from '../../constants';

import useChatContext from '../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

export default function AudioMixer() {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();
  const [, toggleAudioEnabled] = useLocalAudioToggle();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [alignment, setAlignment] = useState('left');

  const name = room?.localParticipant?.identity || 'Participant';

  const sendSystemMsg = (msg: string) => {
    conversation?.sendMessage(msg, { attributes: JSON.stringify({ systemMsg: true }) });
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleAlignment = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);

      if (newAlignment === 'left') {
        sendSystemMsg('In-Person is active');
      } else {
        sendSystemMsg('Virtual is active');
      }
    }
  };

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
        const match = message.body?.match(/^(In-Person|Virtual) is active$/);

        if (match) {
          const [, role] = match;

          if (role === 'In-Person') {
            // TODO class view should locally mute teacher (to prevent double audio)
            // TODO ^ this should be active always, not just here

            // TODO disable teachers speakers (locally mute everyone)

            // unmute classroom mic
            if (name === WEBMOTI_CAMERA_1) {
              toggleAudioEnabled();
            }
          } else {
            // mute classroom mic to remove feedback
            if (name === WEBMOTI_CAMERA_1) {
              toggleAudioEnabled();
            }
          }

          // delete msg so it's not shown when rejoining
          message.remove();
        }
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation, toggleAudioEnabled, name]);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpenPopover}>
        Mixer
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment} aria-label="audio alignment">
          <ToggleButton value="left" aria-label="left aligned">
            In-Person
          </ToggleButton>
          <ToggleButton value="right" aria-label="right aligned">
            Virtual
          </ToggleButton>
        </ToggleButtonGroup>
      </Popover>
    </div>
  );
}
