import { useEffect } from 'react';

import { Theme, useMediaQuery } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';
import { MsgTypes } from '../../../constants';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

const enum Mode {
  Professor = 'PROFESSOR',
  Classroom = 'CLASSROOM',
  Virtual = 'VIRTUAL',
}

export default function ToggleAudioButton(props: { disabled?: boolean; className?: string }) {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks } = useVideoContext();
  const hasAudioTrack = localTracks.some((track) => track.kind === 'audio');
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { conversation } = useChatContext();
  const { room } = useVideoContext();
  const { isProfessor, sendSystemMsg, isWebmotiVideo } = useWebmotiVideoContext();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'm') {
        toggleAudioEnabled();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleAudioEnabled]);

  return (
    <ShortcutTooltip shortcut="A" isCtrlDown>
      <Button
        className={props.className}
        onClick={() => {
          // only switch modes when virtual student toggles audio
          if (!isProfessor && !isWebmotiVideo(room?.localParticipant?.identity || '')) {
            if (isAudioEnabled) {
              // if student is muting their mic, enable class mic
              sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.ModeSwitch, mode: Mode.Classroom }));
            } else {
              // if student unmutes, mute class mic
              sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.ModeSwitch, mode: Mode.Virtual }));
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
    </ShortcutTooltip>
  );
}
