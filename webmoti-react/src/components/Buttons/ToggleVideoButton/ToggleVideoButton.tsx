import { useCallback, useRef } from 'react';

import { Button, useTheme, useMediaQuery } from '@mui/material';

import useDevices from '../../../hooks/useDevices/useDevices';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleVideoButton(props: { disabled?: boolean; className?: string }) {
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const { hasVideoInputDevices } = useDevices();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useSetupHotkeys('alt+v', () => {
    toggleVideo();
  });

  const toggleVideo = useCallback(() => {
    if (Date.now() - lastClickTimeRef.current > 500) {
      lastClickTimeRef.current = Date.now();
      toggleVideoEnabled();
    }
  }, [toggleVideoEnabled]);

  return (
    <ShortcutTooltip shortcut="V" isAltDown>
      <span>
        <Button
          data-testid="toggle-video-button"
          className={props.className}
          onClick={toggleVideo}
          disabled={!hasVideoInputDevices || props.disabled}
          startIcon={
            isVideoEnabled ? (
              <span data-testid="video-on-icon">
                <VideoOnIcon />
              </span>
            ) : (
              <span data-testid="video-off-icon">
                <VideoOffIcon />
              </span>
            )
          }
          // override minWidth: 64 for mobile
          style={{ minWidth: 0 }}
        >
          {!hasVideoInputDevices ? 'No Video' : !isMobile ? (isVideoEnabled ? 'Stop My Video' : 'Start My Video') : ''}
        </Button>
      </span>
    </ShortcutTooltip>
  );
}
