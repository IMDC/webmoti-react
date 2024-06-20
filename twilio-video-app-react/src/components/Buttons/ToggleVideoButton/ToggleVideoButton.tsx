import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import { Theme, useMediaQuery } from '@material-ui/core';
import VideoOffIcon from '../../../icons/VideoOffIcon';
import VideoOnIcon from '../../../icons/VideoOnIcon';

import useDevices from '../../../hooks/useDevices/useDevices';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleVideoButton(props: { disabled?: boolean; className?: string }) {
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const { hasVideoInputDevices } = useDevices();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const toggleVideo = useCallback(() => {
    if (Date.now() - lastClickTimeRef.current > 500) {
      lastClickTimeRef.current = Date.now();
      toggleVideoEnabled();
    }
  }, [toggleVideoEnabled]);

  return (
    <ShortcutTooltip shortcut="V" isCtrlDown>
      <Button
        className={props.className}
        onClick={toggleVideo}
        disabled={!hasVideoInputDevices || props.disabled}
        startIcon={isVideoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
      >
        {!hasVideoInputDevices ? 'No Video' : !isMobile ? (isVideoEnabled ? 'Stop My Video' : 'Start My Video') : ''}
      </Button>
    </ShortcutTooltip>
  );
}
