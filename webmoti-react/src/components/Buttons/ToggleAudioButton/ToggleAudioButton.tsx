import { useMediaQuery, useTheme } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleAudioButton(props: { disabled?: boolean; className?: string }) {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks } = useVideoContext();
  const hasAudioTrack = localTracks.some((track) => track.kind === 'audio');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useSetupHotkeys('alt+a', () => {
    handleAudioToggle();
  });

  const handleAudioToggle = () => {
    const toggleEvent = new CustomEvent('audiotoggle', {
      detail: {
        enabled: !isAudioEnabled,
      },
    });
    window.dispatchEvent(toggleEvent);
    toggleAudioEnabled();
  };

  return (
    <ShortcutTooltip shortcut="A" isAltDown>
      <span>
        <Button
          className={props.className}
          onClick={handleAudioToggle}
          disabled={!hasAudioTrack || props.disabled}
          startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
          data-cy-audio-toggle
          // override minWidth: 64 for mobile
          style={{ minWidth: 0 }}
        >
          {!isMobile && (!hasAudioTrack ? 'No Audio' : isAudioEnabled ? 'Mute' : 'Unmute')}
        </Button>
      </span>
    </ShortcutTooltip>
  );
}
