import { Grid, Typography, Button, ButtonGroup } from '@mui/material';

import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
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

  useSetupHotkeys('ctrl+[', () => {
    decreaseZoom();
  });

  useSetupHotkeys('ctrl+]', () => {
    increaseZoom();
  });

  return (
    <Grid container alignItems="center">
      <Typography style={{ marginRight: '20px' }}>Board Zoom</Typography>

      <ButtonGroup>
        <ShortcutTooltip shortcut="[" isCtrlDown>
          <Button onClick={decreaseZoom} variant="contained">
            -
          </Button>
        </ShortcutTooltip>

        <Button disabled>{zoom}</Button>

        <ShortcutTooltip shortcut="]" isCtrlDown>
          <Button onClick={increaseZoom} variant="contained">
            +
          </Button>
        </ShortcutTooltip>
      </ButtonGroup>
    </Grid>
  );
}
