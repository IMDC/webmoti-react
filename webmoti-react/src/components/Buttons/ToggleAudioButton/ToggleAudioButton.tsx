import { useMediaQuery, useTheme } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { MsgTypes } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

const enum Mode {
  Professor = 'PROFESSOR',
  Classroom = 'CLASSROOM',
  Virtual = 'VIRTUAL',
}

export default function ToggleAudioButton(props: { disabled?: boolean; className?: string }) {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks, room } = useVideoContext();
  const hasAudioTrack = localTracks.some((track) => track.kind === 'audio');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { conversation } = useChatContext();
  const { isProfessor, sendSystemMsg, isWebmotiVideo } = useWebmotiVideoContext();

  useSetupHotkeys('ctrl+m', () => {
    handleAudioToggle();
  });

  const handleAudioToggle = () => {
    const toggleEvent = new CustomEvent('audiotoggle', {
      detail: {
        enabled: !isAudioEnabled,
      },
    });
    window.dispatchEvent(toggleEvent);

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
  };

  return (
    <ShortcutTooltip shortcut="M" isCtrlDown>
      <span>
        <Button
          className={props.className}
          onClick={handleAudioToggle}
          disabled={!hasAudioTrack || props.disabled}
          startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
          data-cy-audio-toggle
        >
          {!hasAudioTrack ? 'No Audio' : !isMobile ? (isAudioEnabled ? 'Mute' : 'Unmute') : ''}
        </Button>
      </span>
    </ShortcutTooltip>
  );
}
