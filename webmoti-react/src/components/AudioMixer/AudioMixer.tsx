import React, { useCallback, useEffect, useState } from 'react';

import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { Box, Button, Popover, TextField, Typography } from '@mui/material';
import { Message } from '@twilio/conversations';

import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import { MsgTypes } from '../../constants';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
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

      if (msgData.type === MsgTypes.ToggleDevice) {
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
