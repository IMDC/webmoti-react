import React from 'react';

import { Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import clsx from 'clsx';
import { LocalAudioTrack, LocalVideoTrack, Participant, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';

import { WEBMOTI_CAMERA_2 } from '../../constants';
import useIsRecording from '../../hooks/useIsRecording/useIsRecording';
import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import useParticipantIsReconnecting from '../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';
import usePublications from '../../hooks/usePublications/usePublications';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useTrack from '../../hooks/useTrack/useTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import AvatarIcon from '../../icons/AvatarIcon';
import AudioLevelIndicator from '../AudioLevelIndicator/AudioLevelIndicator';
import NetworkQualityLevel from '../NetworkQualityLevel/NetworkQualityLevel';

const Container = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',

  [`&.fullWidth`]: {
    gridArea: '1 / 1 / 2 / 3',
    [theme.breakpoints.down('md')]: {
      gridArea: '1 / 1 / 3 / 3',
    },
  },
}));

const InfoContainer = styled('div')({
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 2,
  height: '100%',
  width: '100%',
});

const Identity = styled('div')({
  background: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: '0.1em 0.3em 0.1em 0',
  display: 'inline-flex',
  alignItems: 'center',
  marginRight: '0.4em',
  '& svg': {
    marginLeft: '0.3em',
  },
});

const ReconnectingOverlay = styled('div')({
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
});

const AvatarContainer = styled('div')({
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
  '& svg': {
    transform: 'scale(2)',
  },
});

const RecordingIndicator = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: '0.1em 0.3em 0.1em 0',
  fontSize: '1.2rem',
  height: '28px',
  [theme.breakpoints.down('md')]: {
    bottom: 'auto',
    right: 0,
    top: 0,
  },
}));

const pulsate = keyframes({
  '0%': { background: '#A90000' },
  '50%': { background: '#f00' },
  '100%': { background: '#A90000' },
});

const Circle = styled('div')({
  height: '12px',
  width: '12px',
  background: 'red',
  borderRadius: '100%',
  margin: '0 0.6em',
  animation: `${pulsate} 1.25s ease-out infinite`,
});

interface MainParticipantInfoProps {
  participant: Participant;
  children: React.ReactNode;
}

export default function MainParticipantInfo({ participant, children }: MainParticipantInfoProps) {
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const isLocal = localParticipant === participant;

  const screenShareParticipant = useScreenShareParticipant();
  const isRemoteParticipantScreenSharing = screenShareParticipant && screenShareParticipant !== localParticipant;

  const publications = usePublications(participant);
  const videoPublication = publications.find((p) => !p.trackName.includes('screen') && p.kind === 'video');
  const screenSharePublication = publications.find((p) => p.trackName.includes('screen'));

  const videoTrack = useTrack(screenSharePublication || videoPublication);
  const isVideoEnabled = Boolean(videoTrack);

  const audioPublication = publications.find((p) => p.kind === 'audio');
  const audioTrack = useTrack(audioPublication) as LocalAudioTrack | RemoteAudioTrack | undefined;

  // WEBMOTI_CAMERA_2 (board) camera is never switched off
  const isVideoSwitchedOff =
    useIsTrackSwitchedOff(videoTrack as LocalVideoTrack | RemoteVideoTrack) &&
    participant.identity !== WEBMOTI_CAMERA_2;
  const isParticipantReconnecting = useParticipantIsReconnecting(participant);

  const isRecording = useIsRecording();

  return (
    <Container
      data-cy-main-participant
      data-cy-participant={participant.identity}
      data-testid={`main-participant-${participant.identity}`}
      className={clsx({ fullWidth: !isRemoteParticipantScreenSharing })}
    >
      <InfoContainer>
        <div style={{ display: 'flex' }}>
          <Identity>
            <AudioLevelIndicator audioTrack={audioTrack} />
            <Typography variant="body1" color="inherit" data-testid="participant-identity">
              {participant.identity}
              {isLocal && ' (You)'}
              {screenSharePublication && ' - Screen'}
            </Typography>
          </Identity>
          <NetworkQualityLevel participant={participant} />
        </div>

        {isRecording && (
          <Tooltip
            title="All participants' audio and video is currently being recorded. Visit the app settings to stop recording."
            placement="top"
          >
            <RecordingIndicator>
              <Circle />
              <Typography variant="body1" color="inherit" data-cy-recording-indicator data-testid="recording-indicator">
                Recording
              </Typography>
            </RecordingIndicator>
          </Tooltip>
        )}
      </InfoContainer>

      {(!isVideoEnabled || isVideoSwitchedOff) && (
        <AvatarContainer data-testid="avatar-icon">
          <AvatarIcon />
        </AvatarContainer>
      )}

      {isParticipantReconnecting && (
        <ReconnectingOverlay data-testid="reconnecting-overlay">
          <Typography variant="body1" sx={{ color: 'white' }}>
            Reconnecting...
          </Typography>
        </ReconnectingOverlay>
      )}

      {children}
    </Container>
  );
}
