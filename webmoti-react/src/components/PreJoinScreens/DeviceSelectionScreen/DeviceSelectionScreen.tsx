import {
  Typography,
  Grid,
  Button,
  Switch,
  Tooltip,
  CircularProgress,
  Divider,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import { useKrispToggle } from '../../../hooks/useKrispToggle/useKrispToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import InfoIconOutlined from '../../../icons/InfoIconOutlined';
import SmallCheckIcon from '../../../icons/SmallCheckIcon';
import { useAppState } from '../../../state';
import ToggleAudioButton from '../../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../../Buttons/ToggleVideoButton/ToggleVideoButton';
import { Steps } from '../PreJoinScreens';
import { clientEnv } from '../../../clientEnv';

const PREFIX = 'DeviceSelectionScreen';

const classes = {
  gutterBottom: `${PREFIX}-gutterBottom`,
  marginTop: `${PREFIX}-marginTop`,
  deviceButton: `${PREFIX}-deviceButton`,
  localPreviewContainer: `${PREFIX}-localPreviewContainer`,
  joinButtons: `${PREFIX}-joinButtons`,
  mobileButtonBar: `${PREFIX}-mobileButtonBar`,
  mobileButton: `${PREFIX}-mobileButton`,
  toolTipContainer: `${PREFIX}-toolTipContainer`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.gutterBottom}`]: {
    marginBottom: '1em',
  },

  [`& .${classes.marginTop}`]: {
    marginTop: '1em',
  },

  [`& .${classes.deviceButton}`]: {
    width: '100%',
    border: '2px solid #aaa',
    margin: '1em 0',
  },

  [`& .${classes.localPreviewContainer}`]: {
    paddingRight: '2em',
    marginBottom: '2em',
    [theme.breakpoints.down('md')]: {
      padding: '0 2.5em',
    },
  },

  [`& .${classes.joinButtons}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse',
      width: '100%',
      '& button': {
        margin: '0.5em 0',
      },
    },
  },

  [`& .${classes.mobileButtonBar}`]: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '1.5em 0 1em',
    },
  },

  [`& .${classes.mobileButton}`]: {
    padding: '0.8em 0',
    margin: 0,
  },

  [`& .${classes.toolTipContainer}`]: {
    display: 'flex',
    alignItems: 'center',
    '& div': {
      display: 'flex',
      alignItems: 'center',
    },
    '& svg': {
      marginLeft: '0.3em',
    },
  },
}));

interface DeviceSelectionScreenProps {
  name: string;
  roomName: string;
  setStep: (step: Steps) => void;
}

export default function DeviceSelectionScreen({ name, roomName, setStep }: DeviceSelectionScreenProps) {
  const { getToken, isFetching, isKrispEnabled, isKrispInstalled } = useAppState();
  const { connect: chatConnect } = useChatContext();
  const { connect: videoConnect, isAcquiringLocalTracks, isConnecting } = useVideoContext();
  const { toggleKrisp } = useKrispToggle();
  const disableButtons = isFetching || isAcquiringLocalTracks || isConnecting;

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleJoin = () => {
    getToken(name, roomName).then(({ token }) => {
      videoConnect(token);
      if (clientEnv.DISABLE_TWILIO_CONVERSATIONS() !== 'true') {
        chatConnect(token);
      }
    });
  };

  if (isFetching || isConnecting) {
    return (
      <Grid container justifyContent="center" alignItems="center" direction="column" style={{ height: '100%' }}>
        <div>
          <CircularProgress variant="indeterminate" />
        </div>
        <div>
          <Typography variant="body2" style={{ fontWeight: 'bold', fontSize: '16px' }}>
            Joining Classroom
          </Typography>
        </div>
      </Grid>
    );
  }

  return (
    <Root>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join {roomName}
      </Typography>
      <Grid container justifyContent="center">
        <Grid
          size={{
            md: 7,
            sm: 12,
            xs: 12,
          }}
        >
          <div className={classes.localPreviewContainer}>
            <LocalVideoPreview identity={name} />
          </div>
          <div className={classes.mobileButtonBar}>
            {!isMdUp && (
              <>
                <ToggleAudioButton className={classes.mobileButton} disabled={disableButtons} />
                <ToggleVideoButton className={classes.mobileButton} disabled={disableButtons} />
                <SettingsMenu mobileButtonClass={classes.mobileButton} />
              </>
            )}
          </div>
        </Grid>
        <Grid
          size={{
            md: 5,
            sm: 12,
            xs: 12,
          }}
        >
          <Grid container direction="column" justifyContent="space-between" style={{ alignItems: 'normal' }}>
            <div>
              {isMdUp && (
                <>
                  <ToggleAudioButton className={classes.deviceButton} disabled={disableButtons} />
                  <ToggleVideoButton className={classes.deviceButton} disabled={disableButtons} />
                </>
              )}
            </div>
          </Grid>
        </Grid>

        <Grid
          size={{
            md: 12,
            sm: 12,
            xs: 12,
          }}
        >
          {isKrispInstalled && (
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              style={{ marginBottom: '1em' }}
            >
              <div className={classes.toolTipContainer}>
                <Typography variant="subtitle2">Noise Cancellation</Typography>
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
                // Prevents <Switch /> from being temporarily enabled (and then quickly disabled) in unsupported browsers after
                // isAcquiringLocalTracks becomes false:
                disabled={isKrispEnabled && isAcquiringLocalTracks}
              />
            </Grid>
          )}
          <Divider />
        </Grid>

        <Grid
          size={{
            md: 12,
            sm: 12,
            xs: 12,
          }}
        >
          <Grid container direction="row" alignItems="center" style={{ marginTop: '1em' }}>
            {isMdUp && (
              <Grid size={{ md: 7, sm: 12, xs: 12 }}>
                <SettingsMenu mobileButtonClass={classes.mobileButton} />
              </Grid>
            )}

            <Grid
              size={{
                md: 5,
                sm: 12,
                xs: 12,
              }}
            >
              <div className={classes.joinButtons}>
                {clientEnv.SET_AUTH() !== 'firebase' ? (
                  <Button variant="outlined" color="primary" onClick={() => setStep(Steps.roomNameStep)}>
                    Cancel
                  </Button>
                ) : (
                  // placeholder that keeps join button on the right
                  <span style={{ flexGrow: 1 }} />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  data-cy-join-now
                  onClick={handleJoin}
                  disabled={disableButtons}
                >
                  Join Now
                </Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
}
