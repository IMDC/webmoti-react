import React, { useCallback, useEffect, useState } from 'react';

import { Grid, IconButton, MenuItem, Select, Slider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import { Message } from '@twilio/conversations';
import { useHotkeys } from 'react-hotkeys-hook';

import { MsgTypes } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import InfoIcon from '../../../icons/InfoIcon';
import soundsFile from '../../../sounds/ClearAnnounceTones.wav';
import excuse_me_1 from '../../../sounds/speech/excuse_me_professor_1.mp3';
import excuse_me_2 from '../../../sounds/speech/excuse_me_professor_2.mp3';
import question_1 from '../../../sounds/speech/i_have_a_question_1.mp3';
import question_2 from '../../../sounds/speech/i_have_a_question_2.mp3';
import neutral_excuse_me from '../../../sounds/speech/neutral_excuse_me.mp3';
import neutral_professor from '../../../sounds/speech/neutral_professor.mp3';
import neutral_question from '../../../sounds/speech/neutral_question.mp3';
import professor_1 from '../../../sounds/speech/professor_1.mp3';
import professor_2 from '../../../sounds/speech/professor_2.mp3';
import professor_3 from '../../../sounds/speech/professor_3.mp3';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

interface SoundEntry {
  sound: string;
  name: string;
}

interface SoundsMap {
  [key: string]: SoundEntry;
}

const Sounds: SoundsMap = {
  Bell: { sound: soundsFile, name: 'Bell' },
  Formal1: { sound: excuse_me_1, name: 'Formal 1' },
  Formal2: { sound: excuse_me_2, name: 'Formal 2' },
  Direct1: { sound: question_1, name: 'Direct 1' },
  Direct2: { sound: question_2, name: 'Direct 2' },
  Inquisitive1: { sound: professor_1, name: 'Inquisitive 1' },
  Inquisitive2: { sound: professor_2, name: 'Inquisitive 2' },
  Inquisitive3: { sound: professor_3, name: 'Inquisitive 3' },
  NeutralFormal: { sound: neutral_excuse_me, name: 'Neutral Formal' },
  NeutralDirect: { sound: neutral_question, name: 'Neutral Direct' },
  NeutralInquisitive: { sound: neutral_professor, name: 'Neutral Inquisitive' },
};

export default function NotifyButton() {
  const { conversation } = useChatContext();
  const { sendSystemMsg, isProfessor, checkSystemMsg } = useWebmotiVideoContext();

  const [volume, setVolume] = useState(50);

  const [soundKey, setSoundKey] = useState(Object.keys(Sounds)[0]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const key = event.target.value as string;
    setSoundKey(key);
  };

  const handleVolumeSliderChange = (event: any, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const playSetSound = useCallback(() => {
    const sound = Sounds[soundKey];
    const audio = new Audio(sound.sound);
    // volume is 0 to 1 but slider is 1 to 100
    audio.volume = volume / 100;
    audio.play();
  }, [soundKey, volume]);

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
    if (!isProfessor) {
      playSetSound();
      logSound();
      sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.Notify }));
    }
  };

  useHotkeys(
    'ctrl+a',
    (event) => {
      event.preventDefault();
      notifyProfessor();
    },
    { keyup: true }
  );

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (!checkSystemMsg(message)) {
        return;
      }

      const msgData = JSON.parse(message.body || '');

      if (msgData.type === MsgTypes.Notify && isProfessor) {
        playSetSound();
        message.remove();
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation, isProfessor, playSetSound, checkSystemMsg]);

  return (
    <Grid container justifyContent="center" alignItems="center">
      <ShortcutTooltip shortcut="A" isCtrlDown>
        <Button onClick={notifyProfessor}>Nudge</Button>
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
