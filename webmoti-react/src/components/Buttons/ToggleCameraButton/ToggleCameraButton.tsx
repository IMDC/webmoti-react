import { Button } from '@mui/material';

import { WEBMOTI_CAMERA_1 } from '../../../constants';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleCameraButton(props: { className?: string }) {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  const toggleCamera1 = () => {
    toggleWebmotiVideo(WEBMOTI_CAMERA_1);
  };

  useSetupHotkeys('ctrl+1', () => {
    toggleCamera1();
  });

  return (
    <ShortcutTooltip shortcut="1" isCtrlDown>
      <Button variant="outlined" className={props.className} onClick={toggleCamera1}>
        Class-View ON/OFF
      </Button>
    </ShortcutTooltip>
  );
}
