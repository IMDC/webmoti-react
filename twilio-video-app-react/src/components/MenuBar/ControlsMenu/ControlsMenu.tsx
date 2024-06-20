import { useState } from 'react';

import { Button, Divider, Grid, Popover, Theme, createStyles, makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ChangeZoomButton from '../../Buttons/ChangeZoomButton/ChangeZoomButton';
import MuteClassroomButton from '../../Buttons/MuteClassroomButton/MuteClassroomButton';
import ToggleCameraButton from '../../Buttons/ToggleCameraButton/ToggleCameraButton';
import ToggleCameraButton2 from '../../Buttons/ToggleCameraButton2/ToggleCameraButton2';
import BoardQualityButton from '../../Buttons/BoardQualityButton/BoardQualityButton';
import WaveHandButton from '../../Buttons/WaveHandButton/WaveHandButton';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cameraControlsPopover: {
      padding: theme.spacing(2),
    },
  })
);

export default function ControlsMenu() {
  const classes = useStyles();

  const [cameraControlsAnchorEl, setCameraControlsAnchorEl] = useState<HTMLElement | null>(null);

  const handleCameraControlsClick = (event: React.MouseEvent<HTMLElement>) => {
    setCameraControlsAnchorEl(event.currentTarget);
  };

  const handleCameraControlsClose = () => {
    setCameraControlsAnchorEl(null);
  };

  return (
    <>
      <ShortcutTooltip shortcut="O" isCtrlDown>
        <Button onClick={handleCameraControlsClick}>
          Controls <ExpandMoreIcon />
        </Button>
      </ShortcutTooltip>

      <Popover
        open={Boolean(cameraControlsAnchorEl)}
        anchorEl={cameraControlsAnchorEl}
        onClose={handleCameraControlsClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <div className={classes.cameraControlsPopover}>
          <Grid container justifyContent="center" alignItems="center" direction="column">
            <Grid item>
              <ShortcutTooltip shortcut="R" isCtrlDown>
                <MuteClassroomButton />
              </ShortcutTooltip>
            </Grid>

            <Grid item>
              <Divider />
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item>
                  <ShortcutTooltip shortcut="W" isCtrlDown>
                    <ToggleCameraButton />
                  </ShortcutTooltip>
                </Grid>
                <Grid item>
                  <ShortcutTooltip shortcut="B" isCtrlDown>
                    <ToggleCameraButton2 />
                  </ShortcutTooltip>
                </Grid>
              </Grid>
            </Grid>

            <Grid item>
              <ChangeZoomButton />
            </Grid>

            <Grid item>
              <BoardQualityButton />
            </Grid>

            <Grid item>
              <WaveHandButton />
            </Grid>
          </Grid>
        </div>
      </Popover>
    </>
  );
}
