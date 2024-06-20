import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ChangeZoomButton() {
  const { zoom, setZoomLevel } = useWebmotiVideoContext();

  const increaseZoom = () => {
    if (zoom < 3) {
      setZoomLevel(zoom + 1);
    }
  };

  const decreaseZoom = () => {
    if (zoom > 1) {
      setZoomLevel(zoom - 1);
    }
  };

  return (
    <ButtonGroup>
      <ShortcutTooltip shortcut="-" isCtrlDown>
        <Button onClick={decreaseZoom}>-</Button>
      </ShortcutTooltip>

      <Button disabled>{zoom}</Button>

      <ShortcutTooltip shortcut="+" isCtrlDown>
        <Button onClick={increaseZoom}>+</Button>
      </ShortcutTooltip>
    </ButtonGroup>
  );
}
