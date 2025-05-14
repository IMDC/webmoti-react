import { Button, useMediaQuery, useTheme } from '@mui/material';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
          startIcon={
            isAudioEnabled ? (
              <span data-testid="mic-icon">
                <MicIcon />
              </span>
            ) : (
              <span data-testid="mic-off-icon">
                <MicOffIcon />
              </span>
            )
          }
          data-cy-audio-toggle
          data-testid="toggle-audio-button"
          // override minWidth: 64 for mobile
          style={{ minWidth: 0 }}
        >
          {!isMobile && (!hasAudioTrack ? 'No Audio' : isAudioEnabled ? 'Mute' : 'Unmute')}
        </Button>
      </span>
    </ShortcutTooltip>
  );
}
