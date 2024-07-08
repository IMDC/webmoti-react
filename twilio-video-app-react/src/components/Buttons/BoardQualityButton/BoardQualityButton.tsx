import Button from '@material-ui/core/Button';
import { RemoteVideoTrack } from 'twilio-video';

import { WEBMOTI_CAMERA_2 } from '../../../constants';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function BoardQualityButton() {
  const participants = useParticipants();

  useSetupHotkeys('ctrl+q', () => {
    setQuality();
  });

  const setQuality = () => {
    for (const participant of participants) {
      if (participant.identity === WEBMOTI_CAMERA_2) {
        const tracks = participant.tracks;

        for (const trackPub of tracks.values()) {
          if (trackPub.kind === 'video') {
            // RemoteTrackPublication can be audio or video, so cast to video
            const remoteVideoTrack = trackPub.track as RemoteVideoTrack;

            // make resolution 1080p
            remoteVideoTrack.setContentPreferences({
              renderDimensions: { width: 1920, height: 1080 },
            });

            // just set the first video track
            break;
          }
        }

        return;
      }

      // const videoTracks = participant.videoTracks.values();
      // const firstTrack = videoTracks.next().value;
      // const videoTrack: VideoTrack = firstTrack.track;
      // const mediaStreamTrack: MediaStreamTrack = videoTrack.mediaStreamTrack;
      // await mediaStreamTrack.applyConstraints({
      //   frameRate: 24,
      //   width: 1920,
      //   height: 1080,
      // });
    }
  };

  return (
    <ShortcutTooltip shortcut="Q" isCtrlDown>
      <Button onClick={setQuality}>Quality</Button>
    </ShortcutTooltip>
  );
}
