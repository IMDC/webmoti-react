import React from 'react';

import { styled } from '@mui/material/styles';

import { Typography } from '@mui/material';
import clsx from 'clsx';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

import AvatarIcon from '../../icons/AvatarIcon';
import ScreenShareIcon from '../../icons/ScreenShareIcon';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import NetworkQualityLevel from '../NetworkQualityLevel/NetworkQualityLevel';
import PinIcon from './PinIcon/PinIcon';
import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import usePublications from '../../hooks/usePublications/usePublications';
import useTrack from '../../hooks/useTrack/useTrack';
import useWebmotiVideoContext from '../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { useAppState } from '../../state';

const PREFIX = 'ParticipantInfo';

const classes = {
  container: `${PREFIX}-container`,
  innerContainer: `${PREFIX}-innerContainer`,
  infoContainer: `${PREFIX}-infoContainer`,
  avatarContainer: `${PREFIX}-avatarContainer`,
  reconnectingContainer: `${PREFIX}-reconnectingContainer`,
  screenShareIconContainer: `${PREFIX}-screenShareIconContainer`,
  identity: `${PREFIX}-identity`,
  infoRowBottom: `${PREFIX}-infoRowBottom`,
  typography: `${PREFIX}-typography`,
  hideParticipant: `${PREFIX}-hideParticipant`,
  cursorPointer: `${PREFIX}-cursorPointer`,
  galleryView: `${PREFIX}-galleryView`,
  dominantSpeaker: `${PREFIX}-dominantSpeaker`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.container}`]: {
    isolation: 'isolate',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 0,
    overflow: 'hidden',
    marginBottom: '0.5em',
    '& video': {
      objectFit: 'contain !important',
    },
    borderRadius: '4px',
    border: `${theme.participantBorderWidth}px solid rgb(245, 248, 255)`,
    paddingTop: `calc(${(9 / 16) * 100}% - ${theme.participantBorderWidth}px)`,
    background: 'black',
    [theme.breakpoints.down('md')]: {
      height: theme.sidebarMobileHeight,
      width: `${(theme.sidebarMobileHeight * 16) / 9}px`,
      marginRight: '8px',
      marginBottom: '0',
      fontSize: '12px',
      paddingTop: `${theme.sidebarMobileHeight - 2}px`,
    },
  },

  [`& .${classes.innerContainer}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },

  [`& .${classes.infoContainer}`]: {
    // allow clicks to pass through to video track
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    background: 'transparent',
    top: 0,
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

  [`& .${classes.reconnectingContainer}`]: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(40, 42, 43, 0.75)',
    zIndex: 1,
  },

  [`& .${classes.screenShareIconContainer}`]: {
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '0.18em 0.3em',
    marginRight: '0.3em',
    display: 'flex',
    '& path': {
      fill: 'white',
    },
  },

  [`& .${classes.identity}`]: {
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '0.18em 0.3em 0.18em 0',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },

  [`& .${classes.infoRowBottom}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },

  [`& .${classes.typography}`]: {
    color: 'white',
    [theme.breakpoints.down('md')]: {
      fontSize: '0.75rem',
    },
  },

  [`&.${classes.hideParticipant}`]: {
    display: 'none',
  },

  [`&.${classes.cursorPointer}`]: {
    cursor: 'pointer',
  },

  [`&.${classes.galleryView}`]: {
    border: `${theme.participantBorderWidth}px solid ${theme.galleryViewBackgroundColor}`,
    borderRadius: '8px',
    [theme.breakpoints.down('md')]: {
      position: 'relative',
      width: '100%',
      height: '100%',
      padding: '0',
      fontSize: '12px',
      margin: '0',
      '& video': {
        objectFit: 'cover !important',
      },
    },
  },

  [`&.${classes.dominantSpeaker}`]: {
    border: `solid ${borderWidth}px #7BEAA5`,
  },
}));

const borderWidth = 2;

interface ParticipantInfoProps {
  participant: Participant;
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  isLocalParticipant?: boolean;
  hideParticipant?: boolean;
  isDominantSpeaker?: boolean;
}

export default function ParticipantInfo({
  participant,
  onClick,
  isSelected,
  children,
  isLocalParticipant,
  hideParticipant,
  isDominantSpeaker,
}: ParticipantInfoProps) {
  const publications = usePublications(participant);

  const audioPublication = publications.find((p) => p.kind === 'audio');
  const videoPublication = publications.find((p) => !p.trackName.includes('screen') && p.kind === 'video');

  const isVideoEnabled = Boolean(videoPublication);
  const isScreenShareEnabled = publications.find((p) => p.trackName.includes('screen'));

  const videoTrack = useTrack(videoPublication);
  const isVideoSwitchedOff = useIsTrackSwitchedOff(videoTrack as LocalVideoTrack | RemoteVideoTrack);

  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;
  const isParticipantReconnecting = useParticipantIsReconnecting(participant);

  const { isGalleryViewActive } = useAppState();

  const { isCameraOneOff, isCameraTwoOff } = useWebmotiVideoContext();
  const isCameraOffOrVideoDisabled =
    !isVideoEnabled ||
    // prevent WEBMOTI_CAMERA_2 (board) from being switched off
    (participant.identity !== WEBMOTI_CAMERA_2 && isVideoSwitchedOff) ||
    (participant.identity === WEBMOTI_CAMERA_1 && isCameraOneOff) ||
    (participant.identity === WEBMOTI_CAMERA_2 && isCameraTwoOff);

  return (
    <Root
      className={clsx(classes.container, {
        [classes.hideParticipant]: hideParticipant,
        [classes.cursorPointer]: Boolean(onClick),
        [classes.dominantSpeaker]: isDominantSpeaker,
        [classes.galleryView]: isGalleryViewActive,
      })}
      onClick={onClick}
      data-cy-participant={participant.identity}
      data-testid={`participant-${participant.identity}`}
      data-hidden={hideParticipant}
      data-selected={isSelected}
    >
      <div className={classes.infoContainer}>
        <NetworkQualityLevel participant={participant} />
        <div className={classes.infoRowBottom}>
          {isScreenShareEnabled && (
            <span className={classes.screenShareIconContainer}>
              <ScreenShareIcon />
            </span>
          )}
          <span className={classes.identity}>
            <AudioLevelIndicator audioTrack={audioTrack} participant={participant} />
            <Typography variant="body1" className={classes.typography} component="span">
              {participant.identity}
              {isLocalParticipant && ' (You)'}
            </Typography>
          </span>
        </div>
        <div>{isSelected && <PinIcon />}</div>
      </div>
      <div className={classes.innerContainer}>
        {isCameraOffOrVideoDisabled && (
          <div className={classes.avatarContainer} data-testid="avatar-icon">
            <AvatarIcon />
          </div>
        )}
        {isParticipantReconnecting && (
          <div className={classes.reconnectingContainer}>
            <Typography variant="body1" className={classes.typography}>
              Reconnecting...
            </Typography>
          </div>
        )}
        {children}
      </div>
    </Root>
  );
}
