import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalVideoTrack } from 'twilio-video';

import useVideoContext from '../../../../hooks/useVideoContext/useVideoContext';
import AvatarIcon from '../../../../icons/AvatarIcon';
import LocalAudioLevelIndicator from '../../../LocalAudioLevelIndicator/LocalAudioLevelIndicator';
import VideoTrack from '../../../VideoTrack/VideoTrack';

const PREFIX = 'LocalVideoPreview';

const classes = {
  container: `${PREFIX}-container`,
  innerContainer: `${PREFIX}-innerContainer`,
  identityContainer: `${PREFIX}-identityContainer`,
  identity: `${PREFIX}-identity`,
  avatarContainer: `${PREFIX}-avatarContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.container}`]: {
    position: 'relative',
    height: 0,
    overflow: 'hidden',
    paddingTop: `${(9 / 16) * 100}%`,
    background: 'black',
  },

  [`& .${classes.innerContainer}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },

  [`& .${classes.identityContainer}`]: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },

  [`& .${classes.identity}`]: {
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '0.18em 0.3em',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },

  [`& .${classes.avatarContainer}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'black',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    [theme.breakpoints.down('md')]: {
      '& svg': {
        transform: 'scale(0.7)',
      },
    },
  },
}));

export default function LocalVideoPreview({ identity }: { identity: string }) {
  const { localTracks } = useVideoContext();

  const videoTrack = localTracks.find(
    (track) => !track.name.includes('screen') && track.kind === 'video'
  ) as LocalVideoTrack;

  return (
    <Root className={classes.container}>
      <div className={classes.innerContainer}>
        {videoTrack ? (
          <VideoTrack track={videoTrack} isLocal />
        ) : (
          <div className={classes.avatarContainer}>
            <AvatarIcon />
          </div>
        )}
      </div>
      <div className={classes.identityContainer}>
        <span className={classes.identity}>
          <LocalAudioLevelIndicator />
          <Typography variant="body1" color="inherit" component="span">
            {identity}
          </Typography>
        </span>
      </div>
    </Root>
  );
}
