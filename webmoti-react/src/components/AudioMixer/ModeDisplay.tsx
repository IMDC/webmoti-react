import { useEffect, useState } from 'react';

import { Tooltip, IconButton, Typography } from '@material-ui/core';
import ComputerIcon from '@material-ui/icons/Computer';
import PersonIcon from '@material-ui/icons/Person';
import SchoolIcon from '@material-ui/icons/School';
import { Message } from '@twilio/conversations';

import { Mode } from './AudioMixer';
import { MsgTypes } from '../../constants';
import useChatContext from '../../hooks/useChatContext/useChatContext';
import { checkSystemMsg } from '../../utils';

const ModeDisplay = () => {
  const { conversation } = useChatContext();
  const [currentMode, setCurrentMode] = useState<Mode | null>(null);

  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (!checkSystemMsg(message)) {
        return;
      }

      const msgData = JSON.parse(message.body || '');

      if (msgData.type === MsgTypes.ModeSwitch) {
        setCurrentMode(msgData.mode);
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);
    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation]);

  const modeIcon = () => {
    switch (currentMode) {
      case Mode.Professor:
        return <PersonIcon style={{ fontSize: 20 }} />;
      case Mode.Classroom:
        return <SchoolIcon style={{ fontSize: 20 }} />;
      case Mode.Virtual:
        return <ComputerIcon style={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const modeDescription = () => {
    switch (currentMode) {
      case Mode.Professor:
        return 'Lecture Mode';
      case Mode.Classroom:
        return 'Classroom Interaction';
      case Mode.Virtual:
        return 'Online Participation';
      default:
        return 'Mode';
    }
  };

  return (
    <Tooltip title={<Typography style={{ fontSize: '0.8rem', color: 'white' }}>{modeDescription()}</Typography>} arrow>
      <IconButton size="small" style={{ margin: '8px' }} aria-label="Current speaker mode">
        {modeIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ModeDisplay;
