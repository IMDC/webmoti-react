import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

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
      <Button onClick={decreaseZoom}>-</Button>
      <Button disabled>{zoom}</Button>
      <Button onClick={increaseZoom}>+</Button>
    </ButtonGroup>
  );
}
