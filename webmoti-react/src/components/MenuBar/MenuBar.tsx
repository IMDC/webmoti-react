import { Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

import ControlsMenu from './ControlsMenu/ControlsMenu';
import Menu from './Menu/Menu';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import AudioMixer from '../AudioMixer/AudioMixer';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import NotifyButton from '../Buttons/NotifyButton/NotifyButton';
import RaiseHandButton from '../Buttons/RaiseHandButton/RaiseHandButton';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleCaptionsButton from '../Buttons/ToggleCaptionsButton/ToggleCaptionsButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import { clientEnv } from '../../clientEnv';

const PREFIX = 'MenuBar';

const classes = {
  container: `${PREFIX}-container`,
  hideMobile: `${PREFIX}-hideMobile`,
};

const Root = styled('footer')(({ theme }) => ({
  [`&.${classes.container}`]: {
    backgroundColor: theme.palette.background.default,
    bottom: 0,
    left: 0,
    right: 0,
    height: `${theme.footerHeight}px`,
    position: 'fixed',
    display: 'flex',
    padding: '0 1.43em',
    zIndex: 10,
    [theme.breakpoints.down('lg')]: {
      height: `${theme.mobileFooterHeight}px`,
      padding: 0,
    },
  },

  [`& .${classes.hideMobile}`]: {
    display: 'initial',
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  },
}));

export default function MenuBar() {
  const { room } = useVideoContext();
  // const participants = useParticipants();
  const roomState = useRoomState();

  const isReconnecting = roomState === 'reconnecting';

  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Root className={classes.container}>
      <Grid container justifyContent="space-around" alignItems="center" sx={{ width: '100%' }}>
        {isLgUp && (
          <Grid style={{ flex: 1 }}>
            <Typography variant="body1">
              {/* only show room name in dev */}
              {/* also show when SET_AUTH is none (in cypress tests) */}
              {(clientEnv.IS_DEV_MODE() || !clientEnv.SET_AUTH()) && `${room!.name}`}
              {/* {' | '}
              {participants.length + 1} participant
              {participants.length ? 's' : ''} */}
            </Typography>
          </Grid>
        )}

        <Grid>
          <Grid container justifyContent="center" alignItems="center">
            <ToggleAudioButton disabled={isReconnecting} />
            <ToggleVideoButton disabled={isReconnecting} />

            {isLgUp && <ToggleCaptionsButton />}

            <RaiseHandButton />
            <NotifyButton />

            <AudioMixer />

            {isLgUp && (
              <>
                {clientEnv.DISABLE_TWILIO_CONVERSATIONS() !== 'true' && (
                  <span style={{ marginLeft: '10px' }}>
                    <ToggleChatButton />
                  </span>
                )}
                <ControlsMenu />
                <Menu />
              </>
            )}
          </Grid>
        </Grid>

        {isLgUp && (
          <Grid style={{ flex: 1 }}>
            <Grid container justifyContent="flex-end">
              <EndCallButton />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Root>
  );
}
