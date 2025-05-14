import { useState } from 'react';

import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import clsx from 'clsx';

import ChatInput from './ChatInput/ChatInput';
import ChatWindowHeader from './ChatWindowHeader/ChatWindowHeader';
import MessageList from './MessageList/MessageList';
import TTSMessage from './TTSMessage';
import useChatContext from '../../hooks/useChatContext/useChatContext';

const useStyles = makeStyles((theme: Theme) => ({
  chatWindowContainer: {
    background: '#FFFFFF',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #E4E7E9',
    [theme.breakpoints.down('md')]: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 100,
    },
  },
  hide: {
    display: 'none',
  },
}));

// In this component, we are toggling the visibility of the ChatWindow with CSS instead of
// conditionally rendering the component in the DOM. This is done so that the ChatWindow is
// not unmounted while a file upload is in progress.

export default function ChatWindow() {
  const classes = useStyles();
  const { isChatWindowOpen, messages, conversation } = useChatContext();

  const [isTTSModeOn, setIsTTSModeOn] = useState(false);

  const [ttsMessages, setTTSMessages] = useState<TTSMessage[]>([]);

  const toggleTTSMode = () => {
    setIsTTSModeOn(!isTTSModeOn);
  };

  const addTTSMsg = (message: TTSMessage) => {
    setTTSMessages([...ttsMessages, message]);
  };

  return (
    <aside className={clsx(classes.chatWindowContainer, { [classes.hide]: !isChatWindowOpen })}>
      <ChatWindowHeader isTTSModeOn={isTTSModeOn} />
      <MessageList messages={messages} ttsMessages={ttsMessages} isTTSModeOn={isTTSModeOn} />
      <ChatInput
        conversation={conversation!}
        isChatWindowOpen={isChatWindowOpen}
        isTTSModeOn={isTTSModeOn}
        toggleTTSMode={toggleTTSMode}
        addTTSMsg={addTTSMsg}
      />
    </aside>
  );
}
