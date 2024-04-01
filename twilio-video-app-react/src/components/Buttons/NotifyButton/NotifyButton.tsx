import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import soundsFile from '../../../sounds/ClearAnnounceTones.wav';
import { JSONObject, Message } from '@twilio/conversations';

export default function NotifyButton() {
  const { conversation } = useChatContext();
  const { sendSystemMsg, isProfessor } = useWebmotiVideoContext();

  const notifyProfessor = () => {
    if (!isProfessor) {
      const audio = new Audio(soundsFile);
      audio.play();
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
        const audio = new Audio(soundsFile);
        audio.play();
        message.remove();
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation, isProfessor]);

  return (
    <Tooltip title="Click to grab professor's attention">
      <Button onClick={notifyProfessor}>Notify Professor</Button>
    </Tooltip>
  );
}
