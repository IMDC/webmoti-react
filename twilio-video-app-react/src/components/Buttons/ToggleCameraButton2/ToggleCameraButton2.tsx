import Button from '@material-ui/core/Button';
import { useHotkeys } from 'react-hotkeys-hook';

import { WEBMOTI_CAMERA_2 } from '../../../constants';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleCameraButton(props: { className?: string }) {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  const toggleCamera2 = () => {
    toggleWebmotiVideo(WEBMOTI_CAMERA_2);
  };

  useHotkeys(
    'ctrl+2',
    (event) => {
      event.preventDefault();
      toggleCamera2();
    },
    { keyup: true }
  );

  return (
    <ShortcutTooltip shortcut="2" isCtrlDown>
      <Button className={props.className} onClick={toggleCamera2}>
        Board-View ON/OFF
      </Button>
    </ShortcutTooltip>
  );
}
