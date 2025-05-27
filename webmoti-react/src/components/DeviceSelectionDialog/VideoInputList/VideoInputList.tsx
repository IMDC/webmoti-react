import { useState } from 'react';

import { styled } from '@mui/material/styles';

import { FormControl, MenuItem, Typography, Select } from '@mui/material';
import { LocalVideoTrack } from 'twilio-video';

import { DEFAULT_VIDEO_CONSTRAINTS, SELECTED_VIDEO_INPUT_KEY } from '../../../constants';
import useDevices from '../../../hooks/useDevices/useDevices';
import useMediaStreamTrack from '../../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import VideoTrack from '../../VideoTrack/VideoTrack';

const PREFIX = 'VideoInputList';

const classes = {
  preview: `${PREFIX}-preview`
};

const Root = styled('div')({
  [`& .${classes.preview}`]: {
    width: '300px',
    maxHeight: '200px',
    margin: '0.5em auto',
    '& video': {
      maxHeight: '200px',
    },
  },
});

export default function VideoInputList() {

  const { videoInputDevices } = useDevices();
  const { localTracks } = useVideoContext();

  const localVideoTrack = localTracks.find((track) => track.kind === 'video') as LocalVideoTrack | undefined;
  const mediaStreamTrack = useMediaStreamTrack(localVideoTrack);
  const [storedLocalVideoDeviceId, setStoredLocalVideoDeviceId] = useState(
    window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY)
  );
  const localVideoInputDeviceId = mediaStreamTrack?.getSettings().deviceId || storedLocalVideoDeviceId;

  function replaceTrack(newDeviceId: string) {
    // Here we store the device ID in the component state. This is so we can re-render this component display
    // to display the name of the selected device when it is changed while the users camera is off.
    setStoredLocalVideoDeviceId(newDeviceId);
    window.localStorage.setItem(SELECTED_VIDEO_INPUT_KEY, newDeviceId);
    localVideoTrack?.restart({
      ...(DEFAULT_VIDEO_CONSTRAINTS as MediaTrackConstraints),
      deviceId: { exact: newDeviceId },
    });
  }

  return (
    <Root>
      {localVideoTrack && (
        <div className={classes.preview}>
          <VideoTrack isLocal track={localVideoTrack} />
        </div>
      )}
      {videoInputDevices.length > 1 ? (
        <FormControl variant="standard" fullWidth>
          <Typography variant="subtitle2" gutterBottom>
            Video Input
          </Typography>
          <Select
            onChange={(e) => replaceTrack(e.target.value as string)}
            value={localVideoInputDeviceId || ''}
            variant="outlined"
          >
            {videoInputDevices.map((device) => (
              <MenuItem value={device.deviceId} key={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Video Input
          </Typography>
          <Typography data-testid="video-device-name">
            {localVideoTrack?.mediaStreamTrack.label || 'No Local Video'}
          </Typography>
        </>
      )}
    </Root>
  );
}
