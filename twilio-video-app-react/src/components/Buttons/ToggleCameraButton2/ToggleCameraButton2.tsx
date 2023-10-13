import Button from '@material-ui/core/Button';
import { WEBMOTI_CAMERA_2 } from '../../../constants';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function ToggleCameraButton(props: { className?: string }) {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  return (
    <Button className={props.className} onClick={() => toggleWebmotiVideo(WEBMOTI_CAMERA_2)}>
      Board-View ON/OFF
    </Button>
  );
}
