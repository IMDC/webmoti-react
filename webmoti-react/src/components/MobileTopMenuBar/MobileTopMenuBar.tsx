import { Grid, makeStyles, Theme, Typography, useMediaQuery, useTheme } from '@material-ui/core';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import ToggleCaptionsButton from '../Buttons/ToggleCaptionsButton/ToggleCaptionsButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ControlsMenu from '../MenuBar/ControlsMenu/ControlsMenu';
import Menu from '../MenuBar/Menu/Menu';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    background: 'white',
    paddingLeft: '1em',
    display: 'none',
    height: `${theme.mobileTopBarHeight}px`,
    [theme.breakpoints.down('md')]: {
      display: 'flex',
    },
  },
  endCallButton: {
    height: '28px',
    fontSize: '0.85rem',
    padding: '0 0.6em',
  },
  settingsButton: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'initial',
      height: '28px',
      minWidth: '28px',
      padding: 0,
      margin: '0 1em',
    },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default function MobileTopMenuBar() {
  const classes = useStyles();
  const { room } = useVideoContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container alignItems="center" justifyContent="space-between" className={classes.container}>
      <div className={classes.row}>
        <Typography variant="subtitle1" component="span">
          {/* only show room name in dev */}
          {import.meta.env.MODE === 'development' && !isMobile && room!.name}
        </Typography>

        <ControlsMenu />

        <ToggleCaptionsButton />

        {import.meta.env.VITE_DISABLE_TWILIO_CONVERSATIONS !== 'true' && <ToggleChatButton />}
      </div>

      <div>
        <EndCallButton className={classes.endCallButton} />
        <Menu buttonClassName={classes.settingsButton} />
      </div>
    </Grid>
  );
}
