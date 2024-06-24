import Button from '@material-ui/core/Button';
import { useHotkeys } from 'react-hotkeys-hook';

import { WEBMOTI_CAMERA_1 } from '../../../constants';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleCameraButton(props: { className?: string }) {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  const toggleCamera1 = () => {
    toggleWebmotiVideo(WEBMOTI_CAMERA_1);
  };

  useHotkeys('ctrl+1', (event) => {
    event.preventDefault();
    toggleCamera1();
  });

  return (
    <ShortcutTooltip shortcut="1" isCtrlDown>
      <Button className={props.className} onClick={toggleCamera1}>
        Class-View ON/OFF
      </Button>
    </ShortcutTooltip>
  );
}
