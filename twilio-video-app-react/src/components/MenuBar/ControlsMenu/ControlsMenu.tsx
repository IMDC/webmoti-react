import { useState } from 'react';

import { Button, Popover, Theme, createStyles, makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ChangeZoomButton from '../../Buttons/ChangeZoomButton/ChangeZoomButton';
import MuteClassroomButton from '../../Buttons/MuteClassroomButton/MuteClassroomButton';
import ToggleCameraButton from '../../Buttons/ToggleCameraButton/ToggleCameraButton';
import ToggleCameraButton2 from '../../Buttons/ToggleCameraButton2/ToggleCameraButton2';
import BoardQualityButton from '../../Buttons/BoardQualityButton/BoardQualityButton';
import WaveHandButton from '../../Buttons/WaveHandButton/WaveHandButton';

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
      <Button onClick={handleCameraControlsClick}>
        Controls <ExpandMoreIcon />
      </Button>
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
          <MuteClassroomButton />
          <ToggleCameraButton />
          <ToggleCameraButton2 />
          <ChangeZoomButton />
          <BoardQualityButton />
          <WaveHandButton />
        </div>
      </Popover>
    </>
  );
}
