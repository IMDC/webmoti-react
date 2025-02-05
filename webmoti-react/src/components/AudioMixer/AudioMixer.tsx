import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button, Popover, TextField, Typography } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import { MsgTypes } from '../../constants';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import theme from '../../theme';
import { checkSystemMsg, sendSystemMsg } from '../../utils';

export const enum Mode {
  Professor = 'PROFESSOR',
  Classroom = 'CLASSROOM',
  Virtual = 'VIRTUAL',
}

const enum Devices {
  Speaker = 'SPEAKER',
  ClassMic = 'CLASSMIC',
}

export default function AudioMixer() {
  const { room, muteParticipant } = useVideoContext();
  const { conversation } = useChatContext();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { isAdmin } = useWebmotiVideoContext();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [alignment, setAlignment] = useState<Mode | null>(null);
  const [isClassMicEnabled, setIsClassMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
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
        sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.ModeSwitch, mode: Mode.Professor }));
      } else if (newAlignment === Mode.Classroom) {
        sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.ModeSwitch, mode: Mode.Classroom }));
      } else {
        sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.ModeSwitch, mode: Mode.Virtual }));
      }
    }
  };

  const setClassMicState = useCallback(
    (state: boolean) => {
      // mute classroom mic to remove feedback
      if (name === WEBMOTI_CAMERA_2) {
        if (isAudioEnabled !== state) {
          toggleAudioEnabled();
        }
      }

      setIsClassMicEnabled(state);
    },
    [name, toggleAudioEnabled, isAudioEnabled]
  );

  const setSpeakerState = useCallback(
    (state: boolean) => {
      // disable speakers by muting everyone else
      if (name === WEBMOTI_CAMERA_1 && room && room.participants) {
        for (const participant of room.participants.values()) {
          // don't mute self
          if (name !== participant.identity) {
            // true means mute, so use opposite of speaker state
            muteParticipant(participant, !state);
          }
        }
      }

      setIsSpeakerEnabled(state);
    },
    [muteParticipant, name, room]
  );

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (!checkSystemMsg(message)) {
        return;
      }

      const msgData = JSON.parse(message.body || '');

      if (msgData.type === MsgTypes.ModeSwitch) {
        switch (msgData.mode) {
          case Mode.Professor:
            // - disable mic (to prevent double audio)
            // - disable speakers (optional)
            setClassMicState(false);
            setSpeakerState(false);
            break;

          case Mode.Classroom:
            // for in person students
            // - enable mic
            // - disable speakers (mandatory)
            setClassMicState(true);
            setSpeakerState(false);
            break;

          default:
            // for online students
            // - disable mic
            // - enable speakers
            setClassMicState(false);
            setSpeakerState(true);
        }

        // delete msg so it's not shown when rejoining
        message.remove();

        return;
      } else if (msgData.type === MsgTypes.ToggleDevice) {
        if (msgData.device === Devices.Speaker) {
          setSpeakerState(!isSpeakerEnabled);
        } else {
          setClassMicState(!isClassMicEnabled);
        }

        message.remove();

        return;
      } else if (msgData.type === MsgTypes.MuteDevice) {
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
  }, [conversation, setClassMicState, setSpeakerState, isClassMicEnabled, isSpeakerEnabled, name, toggleAudioEnabled]);

  const handleMuteBtnClick = () => {
    sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.MuteDevice, device: input }));
  };

  // only show mixer if prof or admin
  const showMixer = isAdmin;

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
                    sendSystemMsg(
                      conversation,
                      JSON.stringify({ type: MsgTypes.ToggleDevice, device: Devices.ClassMic })
                    )
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
                    sendSystemMsg(
                      conversation,
                      JSON.stringify({ type: MsgTypes.ToggleDevice, device: Devices.Speaker })
                    )
                  }
                >
                  {isSpeakerEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                  <Typography variant="body2">Speakers</Typography>
                </Button>
              </Box>

              <Box mt={2} display="flex">
                <TextField
                  variant="outlined"
                  label="Participant"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
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
