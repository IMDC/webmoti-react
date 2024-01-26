import { LocalTrackPublication, Participant, RemoteTrackPublication, Track } from 'twilio-video';

import { WEBMOTI_CAMERA_2 } from '../../constants';
import useTrack from '../../hooks/useTrack/useTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import { IVideoTrack } from '../../types';

interface PublicationProps {
  publication: LocalTrackPublication | RemoteTrackPublication;
  participant: Participant;
  isLocalParticipant?: boolean;
  videoOnly?: boolean;
  videoPriority?: Track.Priority | null;
}

export default function Publication({ publication, isLocalParticipant, videoPriority, participant }: PublicationProps) {
  const track = useTrack(publication);

  if (!track) return null;

  // Even though we only have one case here, let's keep this switch() in case
  // we even need to add a 'data' case for rendering DataTracks.
  switch (track.kind) {
    case 'video':
      return (
        <VideoTrack
          track={track as IVideoTrack}
          priority={videoPriority}
          isLocal={!track.name.includes('screen') && isLocalParticipant}
          isWebmotiVideo={participant.identity === WEBMOTI_CAMERA_2}
        />
      );
    // All participant audio tracks are rendered in ParticipantAudioTracks.tsx
    default:
      return null;
  }
}
