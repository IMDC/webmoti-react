import { Grid, Slider } from '@mui/material';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function NotifySlider() {
  const { volume, setVolume } = useWebmotiVideoContext();

  const handleVolumeSliderChange = (_: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  return (
    <Grid container spacing={2}>
      <Grid>
        <VolumeDownIcon />
      </Grid>
      <Grid size="grow">
        <Slider value={volume} onChange={handleVolumeSliderChange} />
      </Grid>
      <Grid>
        <VolumeUpIcon />
      </Grid>
    </Grid>
  );
}
