import { useEffect } from 'react';

import { useMediaQuery, useTheme } from '@mui/material';
import { Button, Tooltip } from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import { Message } from '@twilio/conversations';

import { MsgTypes, WEBMOTI_CAMERA_1 } from '../../../constants';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import { sendSystemMsg } from '../../../utils';
import { checkSystemMsg } from '../../../utils';
import ShortcutIndicator from '../../ShortcutIndicator/ShortcutIndicator';

export default function NotifyButton() {
  const { conversation } = useChatContext();

  const { playSetSound, soundKey } = useWebmotiVideoContext();

  const { room } = useVideoContext();
  const name = room?.localParticipant?.identity || 'Participant';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  }, [conversation, playSetSound, name]);

  const notifyProfessor = () => {
    // don't play for WEBMOTI_CAMERA_1 since it will already play when message added
    if (!(name === WEBMOTI_CAMERA_1)) {
      playSetSound();
    }

    sendSystemMsg(conversation, JSON.stringify({ type: MsgTypes.Notify, sound: soundKey }));
  };

  useSetupHotkeys('a', () => {
    notifyProfessor();
  });

  return (
    <Tooltip title="Play an audio notification in the physical classroom">
      <Button variant="contained" color="primary" onClick={notifyProfessor} style={{ marginLeft: '10px' }}>
        {isMobile ? <NotificationImportantIcon /> : 'Sound Alert'}

        {!isMobile && <ShortcutIndicator shortcut="A" />}
      </Button>
    </Tooltip>
  );
}
