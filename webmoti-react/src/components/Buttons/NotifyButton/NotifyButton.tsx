import React, { Dispatch, SetStateAction } from 'react';

import { Grid, IconButton, MenuItem, Select, Slider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';

import { MsgTypes, WEBMOTI_CAMERA_1 } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import InfoIcon from '../../../icons/InfoIcon';
import { sendSystemMsg } from '../../../utils';
import { Sounds } from '../../MenuBar/SoundsMenu/SoundsMenu';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

interface NotifyButtonProps {
  setSoundKey: Dispatch<SetStateAction<string>>;
  setVolume: Dispatch<SetStateAction<number>>;
  playSetSound: (soundStr?: string) => void;
  soundKey: string;
  volume: number;
}

export default function NotifyButton({ setSoundKey, setVolume, playSetSound, soundKey, volume }: NotifyButtonProps) {
  const { conversation } = useChatContext();

  const { room } = useVideoContext();
  const name = room?.localParticipant?.identity || 'Participant';

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const key = event.target.value as string;
    setSoundKey(key);
  };

  const handleVolumeSliderChange = (_: any, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const getSoundCount = (key: string): [string, number] => {
    const storageKey = `${key}_count`;
    const storageValue = localStorage.getItem(storageKey);
    const count = storageValue ? parseInt(storageValue, 10) : 0;
    return [storageKey, count];
  };

  const logSound = () => {
    // save count in localstorage so it persists
    const [storageKey, count] = getSoundCount(soundKey);
    localStorage.setItem(storageKey, (count + 1).toString(10));
  };

  const showSoundCounts = () => {
    let msg = '';
    for (const key of Object.keys(Sounds)) {
      const [, count] = getSoundCount(key);
      msg += `${key}: ${count}\n`;
    }

    alert(msg);
  };

  const notifyProfessor = () => {
    // don't play for WEBMOTI_CAMERA_1 since it will already play when message added
    if (!(name === WEBMOTI_CAMERA_1)) {
      playSetSound();
    }

    logSound();
    sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.Notify, sound: soundKey }));
  };

  useSetupHotkeys('ctrl+a', () => {
    notifyProfessor();
  });

  return (
    <Grid container justifyContent="center" alignItems="center">
      <ShortcutTooltip shortcut="A" isCtrlDown>
        <Button onClick={notifyProfessor}>Audio Notification</Button>
      </ShortcutTooltip>

      <Select value={soundKey} label="Sound" onChange={handleChange}>
        {/* add all sounds as menu items */}
        {Object.entries(Sounds).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value.name}
          </MenuItem>
        ))}
      </Select>

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

      <IconButton onClick={showSoundCounts}>
        <InfoIcon />
      </IconButton>
    </Grid>
  );
}
