import { Grid, Slider } from '@mui/material';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function NotifySlider() {
  const { volume, setVolume } = useWebmotiVideoContext();

  const handleVolumeSliderChange = (_: any, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  return (
    <Grid container spacing={2}>
      <Grid item>
        <VolumeDownIcon />
      </Grid>

      <Grid item xs>
        <Slider value={volume} onChange={handleVolumeSliderChange} />
      </Grid>

      <Grid item>
        <VolumeUpIcon />
      </Grid>
    </Grid>
  );
}
