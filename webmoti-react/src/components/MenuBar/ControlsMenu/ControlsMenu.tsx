import { useRef, useState } from 'react';

import { styled } from '@mui/material/styles';

import { Button, Divider, Grid, Popover, Typography, useMediaQuery, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';

import NotifyDropdown from './NotifyDropdown';
import NotifySlider from './NotifySlider';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import ChangeZoomButton from '../../Buttons/ChangeZoomButton/ChangeZoomButton';
import MuteClassroomButton from '../../Buttons/MuteClassroomButton/MuteClassroomButton';
import ToggleCameraButton from '../../Buttons/ToggleCameraButton/ToggleCameraButton';
import ToggleCameraButton2 from '../../Buttons/ToggleCameraButton2/ToggleCameraButton2';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

const PREFIX = 'ControlsMenu';

const classes = {
  cameraControlsPopover: `${PREFIX}-cameraControlsPopover`,
  controlsButton: `${PREFIX}-controlsButton`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.cameraControlsPopover}`]: {
    padding: theme.spacing(2),
  },

  [`& .${classes.controlsButton}`]: {
    paddingRight: 0,
    minWidth: 0,
    paddingLeft: 15,

    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
    },
  },
}));

export default function ControlsMenu() {
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Root>
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
        slotProps={{
          paper: {
            sx: {
              padding: (theme) => theme.spacing(3),
            },
          },
        }}
      >
        <div className={classes.cameraControlsPopover}>
          <Grid container justifyContent="center" alignItems="center" direction="column">
            <Grid>
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Audio Controls
              </Typography>
            </Grid>
            <Grid>
              <MuteClassroomButton />
            </Grid>

            <Grid style={{ width: '100%', marginTop: '5px' }}>
              <Divider />
            </Grid>
            <Grid>
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Video Controls
              </Typography>
            </Grid>
            <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ marginBottom: '10px' }}>
              <Grid>
                <ToggleCameraButton />
              </Grid>
              <Grid>
                <ToggleCameraButton2 />
              </Grid>
            </Grid>
            <Grid style={{ marginBottom: '10px' }}>
              <ChangeZoomButton />
            </Grid>
            {/* <Grid item style={{ marginBottom: '10px' }}>
              <BoardQualityButton />
            </Grid> */}

            <Grid style={{ width: '100%', marginBottom: '10px' }}>
              <Divider />
            </Grid>
            <Grid>
              <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                Sound Alert Controls
              </Typography>
            </Grid>
            <Grid style={{ width: '100%', marginBottom: '10px' }}>
              <NotifySlider />
            </Grid>
            <Grid style={{ marginBottom: '10px' }} size="grow">
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
    </Root>
  );
}
