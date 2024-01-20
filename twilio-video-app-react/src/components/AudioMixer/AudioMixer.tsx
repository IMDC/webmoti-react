import { useCallback, useEffect, useState } from 'react';

import { Button, Popover } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import { JSONObject, Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1 } from '../../constants';

import useChatContext from '../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function AudioMixer() {
  const { room, muteParticipant } = useVideoContext();
  const { conversation } = useChatContext();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { isProfessor } = useWebmotiVideoContext();

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

  const setClassMicState = useCallback(
    (state: boolean) => {
      // mute classroom mic to remove feedback
      if (name === WEBMOTI_CAMERA_1) {
        if (isAudioEnabled !== state) {
          toggleAudioEnabled();
        }
      }
    },
    [name, toggleAudioEnabled, isAudioEnabled]
  );

  const setProfSpeakerState = useCallback(
    (state: boolean) => {
      // disable speakers by muting everyone else
      if (isProfessor && room && room.participants) {
        for (const participant of room.participants.values()) {
          // don't mute self
          if (name !== participant.identity) {
            muteParticipant(participant, state);
          }
        }
      }
    },
    [isProfessor, muteParticipant, name, room]
  );

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

          // in person mode:
          // enable mic
          // disable speaker

          // virtual mode:
          // disable mic
          // enable speaker

          if (role === 'In-Person') {
            setClassMicState(true);
            setProfSpeakerState(false);
          } else {
            setClassMicState(false);
            setProfSpeakerState(true);
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
  }, [conversation, setClassMicState, setProfSpeakerState]);

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
