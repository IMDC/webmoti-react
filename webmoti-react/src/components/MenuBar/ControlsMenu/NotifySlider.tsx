import { Grid, Slider } from '@material-ui/core';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function NotifySlider() {
  const { volume, setVolume } = useWebmotiVideoContext();

  const handleVolumeSliderChange = (_: any, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  return (
    <Grid container spacing={2}>
      <Grid item>
        <VolumeDown />
      </Grid>

      <Grid item xs>
        <Slider value={volume} onChange={handleVolumeSliderChange} />
      </Grid>

      <Grid item>
        <VolumeUp />
      </Grid>
    </Grid>
  );
}
