import React, { useEffect, useState } from 'react';
import { Tooltip, IconButton, Typography } from '@material-ui/core';
import SchoolIcon from '@material-ui/icons/School';
import ComputerIcon from '@material-ui/icons/Computer';
import PersonIcon from '@material-ui/icons/Person';
import useChatContext from '../../hooks/useChatContext/useChatContext';

const ModeDisplay = () => {
  const { conversation } = useChatContext();
  const [currentMode, setCurrentMode] = useState<string>('');

  useEffect(() => {
    const handleMessageAdded = (message: { body: any }) => {
      const body = message.body;
      const modePattern = /(\bPROFESSOR\b|\bCLASSROOM\b|\bVIRTUAL\b) is active/;
      const match = body.match(modePattern);

      if (match) {
        setCurrentMode(match[0].split(' ')[0]);
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation]);

  const modeIcon = () => {
    switch (currentMode) {
      case 'PROFESSOR':
        return <PersonIcon style={{ fontSize: 20 }} />;
      case 'CLASSROOM':
        return <SchoolIcon style={{ fontSize: 20 }} />;
      case 'VIRTUAL':
        return <ComputerIcon style={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const modeDescription = () => {
    switch (currentMode) {
      case 'PROFESSOR':
        return 'Lecture Mode';
      case 'CLASSROOM':
        return 'Classroom Interaction';
      case 'VIRTUAL':
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
