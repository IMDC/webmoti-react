import React, { useState } from 'react';

import { Button, Grid, Hidden, Popover, Typography } from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Menu from './Menu/Menu';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import AudioMixer from '../AudioMixer/AudioMixer';
import ModeDisplay from '../AudioMixer/ModeDisplay';
import BoardQualityButton from '../Buttons/BoardQualityButton/BoardQualityButton';
import ChangeZoomButton from '../Buttons/ChangeZoomButton/ChangeZoomButton';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import MuteClassroomButton from '../Buttons/MuteClassroomButton/MuteClassroomButton';
import RaiseHandButton from '../Buttons/RaiseHandButton/RaiseHandButton';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleCameraButton from '../Buttons/ToggleCameraButton/ToggleCameraButton';
import ToggleCameraButton2 from '../Buttons/ToggleCameraButton2/ToggleCameraButton2';
// import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import WaveHandButton from '../Buttons/WaveHandButton/WaveHandButton';
import SoundsPopover from '../SoundsPopover/SoundsPopover';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cameraControlsPopover: {
      padding: theme.spacing(2),
    },
    container: {
      backgroundColor: theme.palette.background.default,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${theme.footerHeight}px`,
      position: 'fixed',
      display: 'flex',
      padding: '0 1.43em',
      zIndex: 10,
      [theme.breakpoints.down('md')]: {
        height: `${theme.mobileFooterHeight}px`,
        padding: 0,
      },
    },
    hideMobile: {
      display: 'initial',
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
  })
);

export default function MenuBar() {
  const classes = useStyles();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const { room } = useVideoContext();
  const participants = useParticipants();
  const [cameraControlsAnchorEl, setCameraControlsAnchorEl] = useState<HTMLElement | null>(null);

  const handleCameraControlsClick = (event: React.MouseEvent<HTMLElement>) => {
    setCameraControlsAnchorEl(event.currentTarget);
  };

  const handleCameraControlsClose = () => {
    setCameraControlsAnchorEl(null);
  };

  return (
    <footer className={classes.container}>
      <Grid container justifyContent="space-around" alignItems="center">
        <Hidden mdDown>
          <Grid style={{ flex: 1 }}>
            <Typography variant="body1">
              {room!.name} | {participants.length + 1} participant{participants.length ? 's' : ''}
            </Typography>
          </Grid>
        </Hidden>
        <Grid item>
          <Grid container justifyContent="center" alignItems="center">
            <ModeDisplay />
            <ToggleAudioButton disabled={isReconnecting} />
            <ToggleVideoButton disabled={isReconnecting} />
            <Button onClick={handleCameraControlsClick}>
              Classroom Controls <ExpandMoreIcon />
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
              </div>
            </Popover>

            <AudioMixer></AudioMixer>

            {/* {process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true' && <ToggleChatButton />} */}
            <RaiseHandButton />

            <WaveHandButton />

            <BoardQualityButton />

            <SoundsPopover />
            <Hidden mdDown>
              <Menu />
            </Hidden>
          </Grid>
        </Grid>
        <Hidden mdDown>
          <Grid style={{ flex: 1 }}>
            <Grid container justifyContent="flex-end">
              <EndCallButton />
            </Grid>
          </Grid>
        </Hidden>
      </Grid>
    </footer>
  );
}
