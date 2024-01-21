import { useCallback, useEffect, useState } from 'react';

import { Box, Button, Popover } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import { JSONObject, Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1 } from '../../constants';

import useChatContext from '../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

const enum Mode {
  Professor = 'PROFESSOR',
  Classroom = 'CLASSROOM',
  Virtual = 'VIRTUAL',
}

export default function AudioMixer() {
  const { room, muteParticipant } = useVideoContext();
  const { conversation } = useChatContext();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { isProfessor } = useWebmotiVideoContext();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [alignment, setAlignment] = useState('');
  const [isClassMicEnabled, setIsClassMicEnabled] = useState(true);
  const [isProfSpeakerEnabled, setIsProfSpeakerEnabled] = useState(true);

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

      if (newAlignment === Mode.Professor) {
        sendSystemMsg(`${Mode.Professor} is active`);
      } else if (newAlignment === Mode.Classroom) {
        sendSystemMsg(`${Mode.Classroom} is active`);
      } else {
        sendSystemMsg(`${Mode.Virtual} is active`);
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

      setIsClassMicEnabled(state);
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

      setIsProfSpeakerEnabled(state);
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
        const pattern = `^(${Mode.Professor}|${Mode.Classroom}|${Mode.Virtual}) is active$`;
        const regex = new RegExp(pattern);
        const match = message.body?.match(regex);

        if (match) {
          const [, newMode] = match;

          if (newMode === Mode.Professor) {
            // - disable mic (to prevent double audio)
            // - disable speakers (optional)
            setClassMicState(false);
            setProfSpeakerState(false);
          } else if (newMode === Mode.Classroom) {
            // for in person students
            // - enable mic
            // - disable speakers (mandatory)
            setClassMicState(true);
            setProfSpeakerState(false);
          } else {
            // for online students
            // - disable mic
            // - enable speakers
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
        <Box p={2} display="flex" flexDirection="column" alignItems="center">
          <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment}>
            <ToggleButton value={Mode.Professor}>Professor</ToggleButton>
            <ToggleButton value={Mode.Classroom}>Classroom</ToggleButton>
            <ToggleButton value={Mode.Virtual}>Virtual</ToggleButton>
          </ToggleButtonGroup>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              style={{ backgroundColor: isClassMicEnabled ? 'green' : 'red' }}
              onClick={() => setClassMicState(!isClassMicEnabled)}
            >
              Class Mic
            </Button>
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              style={{ backgroundColor: isProfSpeakerEnabled ? 'green' : 'red' }}
              onClick={() => setProfSpeakerState(!isProfSpeakerEnabled)}
            >
              Prof Speakers
            </Button>
          </Box>
        </Box>
      </Popover>
    </div>
  );
}
