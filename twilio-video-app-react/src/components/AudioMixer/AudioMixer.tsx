import { Box, Button, Popover, TextField, Typography } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import React, { useCallback, useEffect, useState } from 'react';

import { Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1 } from '../../constants';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import theme from '../../theme';

const enum Mode {
  Professor = 'PROFESSOR',
  Classroom = 'CLASSROOM',
  Virtual = 'VIRTUAL',
}

const enum Devices {
  ProfSpeaker = 'PROFSPEAKER',
  ClassMic = 'CLASSMIC',
}

export default function AudioMixer() {
  const { room, muteParticipant } = useVideoContext();
  const { conversation } = useChatContext();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { isProfessor, isAdmin, sendSystemMsg, checkSystemMsg } = useWebmotiVideoContext();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [alignment, setAlignment] = useState<Mode | null>(null);
  const [isClassMicEnabled, setIsClassMicEnabled] = useState(true);
  const [isProfSpeakerEnabled, setIsProfSpeakerEnabled] = useState(true);
  const [input, setInput] = useState('');

  const name = room?.localParticipant?.identity || 'Participant';

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleAlignment = (_: React.MouseEvent<HTMLElement>, newAlignment: Mode | null) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);

      if (newAlignment === Mode.Professor) {
        sendSystemMsg(conversation, JSON.stringify({ type: 'MODESWITCH', mode: Mode.Professor }));
      } else if (newAlignment === Mode.Classroom) {
        sendSystemMsg(conversation, JSON.stringify({ type: 'MODESWITCH', mode: Mode.Classroom }));
      } else {
        sendSystemMsg(conversation, JSON.stringify({ type: 'MODESWITCH', mode: Mode.Virtual }));
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
            // true means mute, so use opposite of speaker state
            muteParticipant(participant, !state);
          }
        }
      }

      setIsProfSpeakerEnabled(state);
    },
    [isProfessor, muteParticipant, name, room]
  );

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (!checkSystemMsg(message)) {
        return;
      }

      const msgData = JSON.parse(message.body || '');

      if (msgData.type === 'MODESWITCH') {
        switch (msgData.mode) {
          case Mode.Professor:
            // - disable mic (to prevent double audio)
            // - disable speakers (optional)
            setClassMicState(false);
            setProfSpeakerState(false);
            break;

          case Mode.Classroom:
            // for in person students
            // - enable mic
            // - disable speakers (mandatory)
            setClassMicState(true);
            setProfSpeakerState(false);
            break;

          default:
            // for online students
            // - disable mic
            // - enable speakers
            setClassMicState(false);
            setProfSpeakerState(true);
        }

        // delete msg so it's not shown when rejoining
        message.remove();

        return;
      } else if (msgData.type === 'TOGGLEDEVICE') {
        if (msgData.device === Devices.ProfSpeaker) {
          setProfSpeakerState(!isProfSpeakerEnabled);
        } else {
          setClassMicState(!isClassMicEnabled);
        }

        message.remove();

        return;
      } else if (msgData.type === 'MUTEDEVICE') {
        // if this participant was muted
        if (msgData.device === name) {
          toggleAudioEnabled();
        }

        message.remove();
        return;
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [
    conversation,
    setClassMicState,
    setProfSpeakerState,
    isClassMicEnabled,
    isProfSpeakerEnabled,
    name,
    toggleAudioEnabled,
    checkSystemMsg,
  ]);

  const handleMuteBtnClick = () => {
    sendSystemMsg(conversation, JSON.stringify({ type: 'MUTEDEVICE', device: input }));
  };

  // only show mixer if prof or admin
  const showMixer = isProfessor || isAdmin;

  return (
    <>
      {showMixer && (
        <>
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
                <ToggleButton
                  value={Mode.Professor}
                  style={{
                    backgroundColor: alignment === Mode.Professor ? theme.palette.secondary.main : undefined,
                    color: alignment === Mode.Professor ? 'white' : undefined,
                  }}
                >
                  Professor
                </ToggleButton>
                <ToggleButton
                  value={Mode.Classroom}
                  style={{
                    backgroundColor: alignment === Mode.Classroom ? theme.palette.secondary.main : undefined,
                    color: alignment === Mode.Classroom ? 'white' : undefined,
                  }}
                >
                  Classroom
                </ToggleButton>
                <ToggleButton
                  value={Mode.Virtual}
                  style={{
                    backgroundColor: alignment === Mode.Virtual ? theme.palette.secondary.main : undefined,
                    color: alignment === Mode.Virtual ? 'white' : undefined,
                  }}
                >
                  Virtual
                </ToggleButton>
              </ToggleButtonGroup>

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    sendSystemMsg(conversation, JSON.stringify({ type: 'TOGGLEDEVICE', device: Devices.ClassMic }))
                  }
                >
                  {isClassMicEnabled ? <MicIcon /> : <MicOffIcon />}
                  <Typography variant="body2">Class Mic</Typography>
                </Button>
              </Box>

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    sendSystemMsg(conversation, JSON.stringify({ type: 'TOGGLEDEVICE', device: Devices.ProfSpeaker }))
                  }
                >
                  {isProfSpeakerEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                  <Typography variant="body2">Prof Speakers</Typography>
                </Button>
              </Box>

              <Box mt={2} display="flex">
                <TextField
                  variant="outlined"
                  label="Participant"
                  value={input}
                  onChange={event => setInput(event.target.value)}
                />

                <Button variant="contained" color="primary" onClick={handleMuteBtnClick}>
                  Mute
                </Button>
              </Box>
            </Box>
          </Popover>
        </>
      )}
    </>
  );
}
