import React from 'react';

import Button from '@material-ui/core/Button';
import { Theme, useMediaQuery } from '@material-ui/core';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import useChatContext from '../../../hooks/useChatContext/useChatContext';

const enum Mode {
  Professor = 'PROFESSOR',
  Classroom = 'CLASSROOM',
  Virtual = 'VIRTUAL',
}

export default function ToggleAudioButton(props: { disabled?: boolean; className?: string }) {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks } = useVideoContext();
  const hasAudioTrack = localTracks.some(track => track.kind === 'audio');
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { conversation } = useChatContext();
  const { room } = useVideoContext();
  const { isProfessor, sendSystemMsg, isWebmotiVideo } = useWebmotiVideoContext();

  return (
    <Button
      className={props.className}
      onClick={() => {
        // only switch modes when virtual student toggles audio
        if (!isProfessor && !isWebmotiVideo(room?.localParticipant?.identity || '')) {
          if (isAudioEnabled) {
            // if student is muting their mic, enable class mic
            sendSystemMsg(conversation, `${Mode.Classroom} is active`);
          } else {
            // if student unmutes, mute class mic
            sendSystemMsg(conversation, `${Mode.Virtual} is active`);
          }
        }

        toggleAudioEnabled();
      }}
      disabled={!hasAudioTrack || props.disabled}
      startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
      data-cy-audio-toggle
    >
      {!hasAudioTrack ? 'No Audio' : !isMobile ? (isAudioEnabled ? 'Mute' : 'Unmute') : ''}
    </Button>
  );
}
