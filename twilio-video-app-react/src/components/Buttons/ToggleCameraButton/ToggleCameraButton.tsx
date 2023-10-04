import React from 'react';
import Button from '@material-ui/core/Button';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function ToggleCameraButton(props: { className?: string }) {
  const { toggleWebmotiVideo } = useWebmotiVideoContext();

  return (
    <Button className={props.className} onClick={toggleWebmotiVideo}>
      Toggle Camera
    </Button>
  );
}
