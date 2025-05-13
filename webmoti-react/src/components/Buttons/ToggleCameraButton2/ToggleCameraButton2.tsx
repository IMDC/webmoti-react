import { Button } from '@mui/material';

import { WEBMOTI_CAMERA_2 } from '../../../constants';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleCameraButton(props: { className?: string }) {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  const toggleCamera2 = () => {
    toggleWebmotiVideo(WEBMOTI_CAMERA_2);
  };

  useSetupHotkeys('ctrl+2', () => {
    toggleCamera2();
  });

  return (
    <ShortcutTooltip shortcut="2" isCtrlDown>
      <Button variant="outlined" className={props.className} onClick={toggleCamera2}>
        Board-View ON/OFF
      </Button>
    </ShortcutTooltip>
  );
}
