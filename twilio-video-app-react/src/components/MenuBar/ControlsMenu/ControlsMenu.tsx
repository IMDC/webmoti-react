import { useRef, useState } from 'react';

import { Button, Divider, Grid, Popover, Theme, createStyles, makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useHotkeys } from 'react-hotkeys-hook';

import BoardQualityButton from '../../Buttons/BoardQualityButton/BoardQualityButton';
import ChangeZoomButton from '../../Buttons/ChangeZoomButton/ChangeZoomButton';
import MuteClassroomButton from '../../Buttons/MuteClassroomButton/MuteClassroomButton';
import ToggleCameraButton from '../../Buttons/ToggleCameraButton/ToggleCameraButton';
import ToggleCameraButton2 from '../../Buttons/ToggleCameraButton2/ToggleCameraButton2';
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
  const openBtnRef = useRef(null);

  const [cameraControlsAnchorEl, setCameraControlsAnchorEl] = useState<HTMLElement | null>(null);

  const handleCameraControlsClick = (event: React.MouseEvent<HTMLElement>) => {
    setCameraControlsAnchorEl(event.currentTarget);
  };

  const handleCameraControlsClose = () => {
    setCameraControlsAnchorEl(null);
  };

  useHotkeys('ctrl+c', (event) => {
    event.preventDefault();
    if (cameraControlsAnchorEl) {
      handleCameraControlsClose();
    } else {
      setCameraControlsAnchorEl(openBtnRef.current);
    }
  });

  return (
    <>
      <ShortcutTooltip shortcut="C" isCtrlDown>
        <Button ref={openBtnRef} onClick={handleCameraControlsClick}>
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
              <MuteClassroomButton />
            </Grid>

            <Grid item>
              <Divider />
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item>
                  <ToggleCameraButton />
                </Grid>
                <Grid item>
                  <ToggleCameraButton2 />
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
