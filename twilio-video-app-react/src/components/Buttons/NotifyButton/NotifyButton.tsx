import React from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import soundsFile from '../../../sounds/ClearAnnounceTones.wav';

export default function PlaySoundButton() {
  const playSound = () => {
    const audio = new Audio(soundsFile);
    audio.play();
  };

  return (
    <Tooltip title="Click to grab professor's attention">
      <Button onClick={() => playSound()}>Notify Professor</Button>
    </Tooltip>
  );
}
