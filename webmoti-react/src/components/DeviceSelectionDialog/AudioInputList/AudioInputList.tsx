import { FormControl, MenuItem, Typography, Select, Grid } from '@mui/material';
import { LocalAudioTrack } from 'twilio-video';

import { SELECTED_AUDIO_INPUT_KEY } from '../../../constants';
import useDevices from '../../../hooks/useDevices/useDevices';
import useMediaStreamTrack from '../../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import AudioLevelIndicator from '../../AudioLevelIndicator/AudioLevelIndicator';

export default function AudioInputList() {
  const { audioInputDevices } = useDevices();
  const { localTracks } = useVideoContext();

  const localAudioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;
  const srcMediaStreamTrack = localAudioTrack?.noiseCancellation?.sourceTrack;
  const mediaStreamTrack = useMediaStreamTrack(localAudioTrack);
  const localAudioInputDeviceId =
    srcMediaStreamTrack?.getSettings().deviceId || mediaStreamTrack?.getSettings().deviceId;
  function replaceTrack(newDeviceId: string) {
    window.localStorage.setItem(SELECTED_AUDIO_INPUT_KEY, newDeviceId);
    localAudioTrack?.restart({ deviceId: { exact: newDeviceId } });
  }

  return (
    <div>
      <Typography variant="subtitle2" gutterBottom>
        Audio Input
      </Typography>
      <Grid container alignItems="center" justifyContent="space-between">
        <div className="inputSelect">
          {audioInputDevices.length > 1 ? (
            <FormControl variant="standard" fullWidth>
              <Select
                onChange={(e) => replaceTrack(e.target.value as string)}
                value={localAudioInputDeviceId || ''}
                variant="outlined"
              >
                {audioInputDevices.map((device) => (
                  <MenuItem value={device.deviceId} key={device.deviceId}>
                    {device.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography>{localAudioTrack?.mediaStreamTrack.label || 'No Local Audio'}</Typography>
          )}
        </div>
        <AudioLevelIndicator audioTrack={localAudioTrack} color="black" />
      </Grid>
    </div>
  );
}
