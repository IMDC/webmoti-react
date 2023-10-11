import useTrack from '../../hooks/useTrack/useTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { LocalTrackPublication, Participant, RemoteTrackPublication, Track } from 'twilio-video';
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

  const isWebmotiVideo = participant.identity === 'Webmoti-1' || participant.identity === 'Webmoti-2';

  // Even though we only have one case here, let's keep this switch() in case
  // we even need to add a 'data' case for rendering DataTracks.
  switch (track.kind) {
    case 'video':
      const videoTrackElement = (
        <VideoTrack
          track={track as IVideoTrack}
          priority={videoPriority}
          isLocal={!track.name.includes('screen') && isLocalParticipant}
          isWebmotiVideo={isWebmotiVideo}
        />
      );

      if (isWebmotiVideo) {
        return (
          <TransformWrapper>
            <TransformComponent>{videoTrackElement}</TransformComponent>
          </TransformWrapper>
        );
      }

      return videoTrackElement;

    // All participant audio tracks are rendered in ParticipantAudioTracks.tsx
    default:
      return null;
  }
}
