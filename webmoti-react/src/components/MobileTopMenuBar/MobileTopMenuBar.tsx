import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import ToggleCaptionsButton from '../Buttons/ToggleCaptionsButton/ToggleCaptionsButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ControlsMenu from '../MenuBar/ControlsMenu/ControlsMenu';
import Menu from '../MenuBar/Menu/Menu';
import { DISABLE_TWILIO_CONVERSATIONS } from '../../clientEnv';

const PREFIX = 'MobileTopMenuBar';

const classes = {
  container: `${PREFIX}-container`,
  endCallButton: `${PREFIX}-endCallButton`,
  settingsButton: `${PREFIX}-settingsButton`,
  row: `${PREFIX}-row`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.container}`]: {
    background: 'white',
    paddingLeft: '1em',
    display: 'none',
    height: `${theme.mobileTopBarHeight}px`,
    [theme.breakpoints.down('lg')]: {
      display: 'flex',
    },
  },

  [`& .${classes.endCallButton}`]: {
    height: '28px',
    fontSize: '0.85rem',
    padding: '0 0.6em',
  },

  [`& .${classes.settingsButton}`]: {
    display: 'none',
    [theme.breakpoints.down('lg')]: {
      display: 'initial',
      height: '28px',
      minWidth: '28px',
      padding: 0,
      margin: '0 1em',
    },
  },

  [`& .${classes.row}`]: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default function MobileTopMenuBar() {
  const { room } = useVideoContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledGrid container alignItems="center" justifyContent="space-between" className={classes.container}>
      <div className={classes.row}>
        <Typography variant="subtitle1" component="span">
          {/* only show room name in dev */}
          {process.env.NODE_ENV === 'development' && !isMobile && room!.name}
        </Typography>

        <ControlsMenu />

        <ToggleCaptionsButton />

        {DISABLE_TWILIO_CONVERSATIONS !== 'true' && <ToggleChatButton />}
      </div>
      <div>
        <EndCallButton className={classes.endCallButton} />
        <Menu buttonClassName={classes.settingsButton} />
      </div>
    </StyledGrid>
  );
}
