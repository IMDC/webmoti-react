import { useState } from 'react';

import { Grid, Typography } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { RemoteVideoTrack } from 'twilio-video';

import { WEBMOTI_CAMERA_2 } from '../../../constants';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function BoardQualityButton() {
  const participants = useParticipants();

  const [qualityState, setQualityState] = useState('720');

  useSetupHotkeys('ctrl+q', () => {
    setQualityState('1080');
    setQuality('1080');
  });

  const handleQualityChange = (_: React.MouseEvent<HTMLElement>, newQuality: string) => {
    if (newQuality !== null) {
      setQualityState(newQuality);
      setQuality(newQuality);
    }
  };

  const setQuality = (quality: string) => {
    for (const participant of participants) {
      if (participant.identity === WEBMOTI_CAMERA_2) {
        const tracks = participant.tracks;

        for (const trackPub of tracks.values()) {
          if (trackPub.kind === 'video') {
            // RemoteTrackPublication can be audio or video, so cast to video
            const remoteVideoTrack = trackPub.track as RemoteVideoTrack;

            const resolution = quality === '1080' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
            remoteVideoTrack.setContentPreferences({
              renderDimensions: resolution,
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
    <Grid container alignItems="center">
      <Typography style={{ marginRight: '20px' }}>Board Quality</Typography>

      <ShortcutTooltip shortcut="Q" isCtrlDown>
        <ToggleButtonGroup
          value={qualityState}
          exclusive
          onChange={handleQualityChange}
          aria-label="Change video quality"
        >
          <ToggleButton value="720" aria-label="720p">
            720p
          </ToggleButton>
          <ToggleButton value="1080" aria-label="1080p">
            1080p
          </ToggleButton>
        </ToggleButtonGroup>
      </ShortcutTooltip>
    </Grid>
  );
}
