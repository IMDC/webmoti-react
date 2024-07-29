import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Popover } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Message } from '@twilio/conversations';

import { MsgTypes, WEBMOTI_CAMERA_1 } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
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
import NotifyButton from '../../Buttons/NotifyButton/NotifyButton';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

interface SoundEntry {
  sound: string;
  name: string;
}

interface SoundsMap {
  [key: string]: SoundEntry;
}

export const Sounds: SoundsMap = {
  Bell: { sound: soundsFile, name: 'Bell' },
  Formal1: { sound: excuse_me_1, name: 'Formal Male' },
  Formal2: { sound: excuse_me_2, name: 'Formal Female' },
  Direct1: { sound: question_1, name: 'Direct Male' },
  Direct2: { sound: question_2, name: 'Direct Female' },
  Inquisitive1: { sound: professor_1, name: 'Inquisitive Male' },
  Inquisitive2: { sound: professor_2, name: 'Inquisitive Female' },
  Inquisitive3: { sound: professor_3, name: 'Inquisitive Female 2' },
  NeutralFormal: { sound: neutral_excuse_me, name: 'Formal Neutral' },
  NeutralDirect: { sound: neutral_question, name: 'Direct Neutral' },
  NeutralInquisitive: { sound: neutral_professor, name: 'Inquisitive Neutral' },
};

export default function SoundsMenu() {
  const { checkSystemMsg } = useWebmotiVideoContext();

  const { conversation } = useChatContext();

  const { room } = useVideoContext();
  const name = room?.localParticipant?.identity || 'Participant';

  const [volume, setVolume] = useState(50);

  const [soundKey, setSoundKey] = useState(Object.keys(Sounds)[0]);

  const openBtnRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  useSetupHotkeys('ctrl+s', () => {
    if (anchorEl) {
      handlePopoverClose();
    } else {
      setAnchorEl(openBtnRef.current);
    }
  });

  const playSetSound = useCallback(
    (soundStr?: string) => {
      const key = soundStr ? soundStr : soundKey;
      const sound = Sounds[key];
      const audio = new Audio(sound.sound);
      // volume is 0 to 1 but slider is 1 to 100
      audio.volume = volume / 100;
      audio.play();
    },
    [soundKey, volume]
  );

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (!checkSystemMsg(message)) {
        return;
      }

      const msgData = JSON.parse(message.body || '');

      if (msgData.type === MsgTypes.Notify && name === WEBMOTI_CAMERA_1) {
        playSetSound(msgData.sound);
        message.remove();
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation, playSetSound, checkSystemMsg, name]);

  return (
    <>
      <ShortcutTooltip shortcut="S" isCtrlDown>
        <Button ref={openBtnRef} onClick={handleButtonClick}>
          Sounds <ExpandMoreIcon />
        </Button>
      </ShortcutTooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <div style={{ padding: '16px' }}>
          <NotifyButton
            setSoundKey={setSoundKey}
            playSetSound={playSetSound}
            soundKey={soundKey}
            volume={volume}
            setVolume={setVolume}
          />
        </div>
      </Popover>
    </>
  );
}
