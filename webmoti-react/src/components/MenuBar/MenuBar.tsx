import { Grid, Hidden, Typography } from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

import ControlsMenu from './ControlsMenu/ControlsMenu';
import Menu from './Menu/Menu';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import AudioMixer from '../AudioMixer/AudioMixer';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import RaiseHandButton from '../Buttons/RaiseHandButton/RaiseHandButton';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleCaptionsButton from '../Buttons/ToggleCaptionsButton/ToggleCaptionsButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import NotifyButton from '../Buttons/NotifyButton/NotifyButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

  const { room } = useVideoContext();
  // const participants = useParticipants();
  const roomState = useRoomState();

  const isReconnecting = roomState === 'reconnecting';

  return (
    <footer className={classes.container}>
      <Grid container justifyContent="space-around" alignItems="center">
        <Hidden mdDown>
          <Grid style={{ flex: 1 }}>
            <Typography variant="body1">
              {/* only show room name in dev */}
              {process.env.NODE_ENV === 'development' && `${room!.name}`}
              {/* {' | '}
              {participants.length + 1} participant
              {participants.length ? 's' : ''} */}
            </Typography>
          </Grid>
        </Hidden>

        <Grid item>
          <Grid container justifyContent="center" alignItems="center">
            <ToggleAudioButton disabled={isReconnecting} />
            <ToggleVideoButton disabled={isReconnecting} />

            <ToggleCaptionsButton />

            <RaiseHandButton />
            <NotifyButton />

            <AudioMixer />

            {process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true' && (
              <span style={{ marginLeft: '10px' }}>
                <ToggleChatButton />
              </span>
            )}

            <ControlsMenu />

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
