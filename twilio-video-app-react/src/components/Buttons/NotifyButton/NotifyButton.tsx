import React, { useCallback, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import soundsFile from '../../../sounds/ClearAnnounceTones.wav';
import professor_1 from '../../../sounds/speech/professor_1.mp3';
import professor_2 from '../../../sounds/speech/professor_2.mp3';
import professor_3 from '../../../sounds/speech/professor_3.mp3';
import excuse_me_1 from '../../../sounds/speech/excuse_me_professor_1.mp3';
import excuse_me_2 from '../../../sounds/speech/excuse_me_professor_2.mp3';
import question_1 from '../../../sounds/speech/i_have_a_question_1.mp3';
import question_2 from '../../../sounds/speech/i_have_a_question_2.mp3';
import { JSONObject, Message } from '@twilio/conversations';
import { MenuItem, Select } from '@material-ui/core';

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
};

export default function NotifyButton() {
  const { conversation } = useChatContext();
  const { sendSystemMsg, isProfessor } = useWebmotiVideoContext();

  const [soundKey, setSoundKey] = useState(Object.keys(Sounds)[0]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const key = event.target.value as string;
    setSoundKey(key);
  };

  const playSetSound = useCallback(() => {
    const sound = Sounds[soundKey];
    const audio = new Audio(sound.sound);
    audio.play();
  }, [soundKey]);

  const notifyProfessor = () => {
    if (!isProfessor) {
      playSetSound();
      sendSystemMsg(conversation, 'Student needs attention');
    }
  };

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      let isSystemMsg = false;
      const attrObj = message.attributes as JSONObject;
      if (attrObj.attributes !== undefined) {
        const attrSysMsg = JSON.parse(attrObj.attributes as string).systemMsg;
        if (attrSysMsg !== undefined) {
          isSystemMsg = true;
        }
      }

      if (isSystemMsg && message.body === 'Student needs attention' && isProfessor) {
        playSetSound();
        message.remove();
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation, isProfessor, playSetSound]);

  return (
    <>
      <Tooltip title="Click to grab professor's attention">
        <Button onClick={notifyProfessor}>Nudge</Button>
      </Tooltip>

      <Select value={soundKey} label="Sound" onChange={handleChange}>
        {/* add all sounds as menu items */}
        {Object.entries(Sounds).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value.name}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
