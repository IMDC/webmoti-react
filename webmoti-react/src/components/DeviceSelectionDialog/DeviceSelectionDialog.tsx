import {
  DialogContent,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  Button,
  DialogTitle,
  FormControlLabel,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import AudioInputList from './AudioInputList/AudioInputList';
import AudioOutputList from './AudioOutputList/AudioOutputList';
import MaxGalleryViewParticipants from './MaxGalleryViewParticipants/MaxGalleryViewParticipants';
import VideoInputList from './VideoInputList/VideoInputList';
import { useKrispToggle } from '../../hooks/useKrispToggle/useKrispToggle';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import InfoIconOutlined from '../../icons/InfoIconOutlined';
import KrispLogo from '../../icons/KrispLogo';
import SmallCheckIcon from '../../icons/SmallCheckIcon';
import { useAppState } from '../../state';

const PREFIX = 'DeviceSelectionDialog';

const classes = {
  container: `${PREFIX}-container`,
  button: `${PREFIX}-button`,
  paper: `${PREFIX}-paper`,
  headline: `${PREFIX}-headline`,
  listSection: `${PREFIX}-listSection`,
  noiseCancellationContainer: `${PREFIX}-noiseCancellationContainer`,
  krispContainer: `${PREFIX}-krispContainer`,
  krispInfoText: `${PREFIX}-krispInfoText`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.container}`]: {
    width: '600px',
    minHeight: '400px',
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100vw - 32px)',
    },
    '& .inputSelect': {
      width: 'calc(100% - 35px)',
    },
  },

  [`& .${classes.button}`]: {
    float: 'right',
  },

  [`& .${classes.paper}`]: {
    [theme.breakpoints.down('sm')]: {
      margin: '16px',
    },
  },

  [`& .${classes.headline}`]: {
    marginBottom: '1.3em',
    fontSize: '1.1rem',
  },

  [`& .${classes.listSection}`]: {
    margin: '2em 0 0.8em',
    '&:first-of-type': {
      margin: '1em 0 2em 0',
    },
  },

  [`& .${classes.noiseCancellationContainer}`]: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  [`& .${classes.krispContainer}`]: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      '&:not(:last-child)': {
        margin: '0 0.3em',
      },
    },
  },

  [`& .${classes.krispInfoText}`]: {
    margin: '0 0 1.5em 0.5em',
  },
}));

export default function DeviceSelectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isAcquiringLocalTracks } = useVideoContext();
  const { isKrispEnabled, isKrispInstalled } = useAppState();
  const { toggleKrisp } = useKrispToggle();

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <StyledDialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
      <DialogTitle>Audio and Video Settings</DialogTitle>
      <Divider />
      <DialogContent className={classes.container}>
        <div className={classes.listSection}>
          <Typography variant="h6" className={classes.headline}>
            Video
          </Typography>
          <VideoInputList />
        </div>
        <Divider />
        <div className={classes.listSection}>
          <Typography variant="h6" className={classes.headline}>
            Audio
          </Typography>

          {isKrispInstalled && (
            <div className={classes.noiseCancellationContainer}>
              <div className={classes.krispContainer}>
                <Typography variant="subtitle2">Noise Cancellation powered by </Typography>
                <KrispLogo />
                <Tooltip
                  title="Suppress background noise from your microphone"
                  leaveDelay={250}
                  leaveTouchDelay={15000}
                  enterTouchDelay={0}
                >
                  <div>
                    <InfoIconOutlined />
                  </div>
                </Tooltip>
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!isKrispEnabled}
                    checkedIcon={<SmallCheckIcon />}
                    disableRipple={true}
                    onClick={toggleKrisp}
                  />
                }
                label={isKrispEnabled ? 'Enabled' : 'Disabled'}
                style={{ marginRight: 0 }}
                disabled={isAcquiringLocalTracks}
              />
            </div>
          )}
          {isKrispInstalled && (
            <Typography variant="body1" color="textSecondary" className={classes.krispInfoText}>
              Suppress background noise from your microphone.
            </Typography>
          )}

          <AudioInputList />
        </div>
        <div className={classes.listSection}>
          <AudioOutputList />
        </div>
        {isMdUp && (
          <>
            <Divider />
            <div className={classes.listSection}>
              <Typography variant="h6" className={classes.headline}>
                Gallery View
              </Typography>
              <MaxGalleryViewParticipants />
            </div>
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button color="primary" variant="contained" className={classes.button} onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
