import React from 'react';
import Button from '@material-ui/core/Button';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

const ToggleCameraButton = () => {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  const handleButtonClick = () => {
    toggleWebmotiVideo();
  };

  return (
    <Button variant="contained" style={{ backgroundColor: 'transparent', color: 'black' }} onClick={handleButtonClick}>
      Toggle Camera
    </Button>
  );
};

export default ToggleCameraButton;
