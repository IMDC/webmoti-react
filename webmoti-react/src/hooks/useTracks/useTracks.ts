import { useEffect, useState } from 'react';

import { RemoteParticipant, RemoteTrack } from 'twilio-video';

import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useTracks(participant: RemoteParticipant) {
  const [tracks, setTracks] = useState<RemoteTrack[]>([]);
  const { room } = useVideoContext();

  const name = room?.localParticipant?.identity || 'Participant';

  useEffect(() => {
    const subscribedTracks = Array.from(participant.tracks.values())
      .filter((trackPublication) => trackPublication.track !== null)
      .map((trackPublication) => trackPublication.track!);

    setTracks(subscribedTracks);

    const handleTrackSubscribed = (track: RemoteTrack) => {
      // TODO
      // ! this is a temporary solution
      // a better way would be to use server side subscription rules
      // https://www.twilio.com/docs/video/api/track-subscriptions#static-example

      // make the board-view unit ignore all tracks
      if (name === WEBMOTI_CAMERA_2) {
        return;
      }

      // make the student-view unit only render virtual student tracks and not the board-view track.
      // this is to avoid the prof audio playing out of the speakers
      if (name === WEBMOTI_CAMERA_1 && participant.identity === WEBMOTI_CAMERA_2) {
        return;
      }

      setTracks((prevTracks) => [...prevTracks, track]);
    };
    const handleTrackUnsubscribed = (track: RemoteTrack) =>
      setTracks((prevTracks) => prevTracks.filter((t) => t !== track));

    participant.on('trackSubscribed', handleTrackSubscribed);
    participant.on('trackUnsubscribed', handleTrackUnsubscribed);
    return () => {
      participant.off('trackSubscribed', handleTrackSubscribed);
      participant.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [participant, name]);

  return tracks;
}
