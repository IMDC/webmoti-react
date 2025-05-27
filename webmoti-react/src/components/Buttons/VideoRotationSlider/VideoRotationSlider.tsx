import { Slider, Typography } from '@mui/material';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function VideoRotationSlider() {
  const { rotation, setRotation } = useWebmotiVideoContext();

  const handleRotationChange = (_: unknown, newValue: number | number[]) => {
    setRotation(newValue as number);
  };

  return (
    <div>
      <Typography id="rotation-slider" gutterBottom>
        Rotation
      </Typography>
      <Slider
        value={rotation}
        onChange={handleRotationChange}
        aria-labelledby="rotation-slider"
        step={1}
        min={-90}
        max={90}
        valueLabelDisplay="auto"
      />
    </div>
  );
}
