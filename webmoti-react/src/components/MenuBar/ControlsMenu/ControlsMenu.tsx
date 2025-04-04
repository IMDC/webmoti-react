import { useRef, useState } from 'react';

import {
  Button,
  Divider,
  Grid,
  Popover,
  Theme,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsIcon from '@material-ui/icons/Settings';

import NotifyDropdown from './NotifyDropdown';
import NotifySlider from './NotifySlider';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
// import BoardQualityButton from '../../Buttons/BoardQualityButton/BoardQualityButton';
import ChangeZoomButton from '../../Buttons/ChangeZoomButton/ChangeZoomButton';
import MuteClassroomButton from '../../Buttons/MuteClassroomButton/MuteClassroomButton';
import ToggleCameraButton from '../../Buttons/ToggleCameraButton/ToggleCameraButton';
import ToggleCameraButton2 from '../../Buttons/ToggleCameraButton2/ToggleCameraButton2';
// import WaveHandButton from '../../Buttons/WaveHandButton/WaveHandButton';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cameraControlsPopover: {
      padding: theme.spacing(2),
    },
    controlsButton: {
      paddingRight: 0,
      minWidth: 0,
      paddingLeft: 15,

      [theme.breakpoints.down('sm')]: {
        paddingLeft: 0,
      },
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

  useSetupHotkeys('alt+c', () => {
    if (cameraControlsAnchorEl) {
      handleCameraControlsClose();
    } else {
      setCameraControlsAnchorEl(openBtnRef.current);
    }
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <ShortcutTooltip shortcut="C" isAltDown>
        <Button ref={openBtnRef} onClick={handleCameraControlsClick} className={classes.controlsButton}>
          {isMobile ? <SettingsIcon /> : 'Controls'} <ExpandMoreIcon />
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
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Audio Controls
              </Typography>
            </Grid>
            <Grid item>
              <MuteClassroomButton />
            </Grid>

            <Grid item style={{ width: '100%', marginTop: '5px' }}>
              <Divider />
            </Grid>
            <Grid item>
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Video Controls
              </Typography>
            </Grid>
            <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ marginBottom: '10px' }}>
              <Grid item>
                <ToggleCameraButton />
              </Grid>
              <Grid item>
                <ToggleCameraButton2 />
              </Grid>
            </Grid>
            <Grid item style={{ marginBottom: '10px' }}>
              <ChangeZoomButton />
            </Grid>
            {/* <Grid item style={{ marginBottom: '10px' }}>
              <BoardQualityButton />
            </Grid> */}

            <Grid item style={{ width: '100%', marginBottom: '10px' }}>
              <Divider />
            </Grid>
            <Grid item>
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Sound Alert Controls
              </Typography>
            </Grid>
            <Grid item style={{ width: '100%', marginBottom: '10px' }}>
              <NotifySlider />
            </Grid>
            <Grid item xs style={{ marginBottom: '10px' }}>
              <NotifyDropdown />
            </Grid>

            {/* <Grid item style={{ width: '100%' }}>
              <Divider />
            </Grid>
            <Grid item>
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Hand Waving
              </Typography>
            </Grid>
            <Grid item>
              <WaveHandButton />
            </Grid> */}
          </Grid>
        </div>
      </Popover>
    </>
  );
}
