import React from 'react';

import { Button, makeStyles } from '@material-ui/core';
import { Conversation, Message } from '@twilio/conversations';
import { LocalParticipant } from 'twilio-video';

import MediaMessage from './MediaMessage/MediaMessage';
import MessageInfo from './MessageInfo/MessageInfo';
import MessageListScrollContainer from './MessageListScrollContainer/MessageListScrollContainer';
import TextMessage from './TextMessage/TextMessage';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import SendMessageIcon from '../../../icons/SendMessageIcon';
import { sendSystemAudioMsg } from '../../../utils';
import TTSMessage from '../TTSMessage';

interface MessageListProps {
  messages: Message[];
  ttsMessages?: TTSMessage[];
  isTTSModeOn?: boolean;
}

const useStyles = makeStyles({
  ttsMessageWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.3em',
  },
  sendButton: {
    marginLeft: '0.5em',
    padding: '0.3em',
    minWidth: 'auto',
  },
});

const getFormattedTime = (message?: Message | TTSMessage) =>
  message?.dateCreated?.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' }).toLowerCase();

const showChatMessages = (messages: Message[], localParticipant: LocalParticipant) => {
  return messages.map((message, idx) => {
    const time = getFormattedTime(message)!;
    const previousTime = getFormattedTime(messages[idx - 1]);

    // Display the MessageInfo component when the author or formatted timestamp differs from the previous message
    const shouldDisplayMessageInfo = time !== previousTime || message.author !== messages[idx - 1]?.author;

    const isLocalParticipant = localParticipant.identity === message.author;

    return (
      <React.Fragment key={message.sid}>
        {shouldDisplayMessageInfo && (
          <MessageInfo author={message.author!} isLocalParticipant={isLocalParticipant} dateCreated={time} />
        )}
        {message.type === 'text' && <TextMessage body={message.body!} isLocalParticipant={isLocalParticipant} />}
        {message.type === 'media' && <MediaMessage media={message.attachedMedia![0]} />}
      </React.Fragment>
    );
  });
};

const showTTSMessages = (conversation: Conversation | null, messages: TTSMessage[], classes: any) => {
  return messages.map((message, idx) => {
    const time = getFormattedTime(message)!;
    const previousTime = getFormattedTime(messages[idx - 1]);

    const shouldDisplayMessageInfo = time !== previousTime;

    return (
      <React.Fragment key={idx}>
        {shouldDisplayMessageInfo && <MessageInfo isLocalParticipant dateCreated={time} />}
        {/* need to use arrow function here because messages uses "this" property */}
        <div className={classes.ttsMessageWrapper}>
          <TextMessage body={message.text!} onClick={() => message.play()} isLocalParticipant isTTSMsg />
          <Button
            className={classes.sendButton}
            color="primary"
            variant="contained"
            disabled={message.audioBlob === null}
            onClick={() => {
              if (conversation) {
                sendSystemAudioMsg(conversation, message);
              }
            }}
          >
            <SendMessageIcon />
          </Button>
        </div>
      </React.Fragment>
    );
  });
};

export default function MessageList({ messages, ttsMessages = [], isTTSModeOn = false }: MessageListProps) {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();
  const classes = useStyles();

  const localParticipant = room!.localParticipant;

  return (
    <MessageListScrollContainer messages={messages}>
      {isTTSModeOn ? showTTSMessages(conversation, ttsMessages, classes) : showChatMessages(messages, localParticipant)}
    </MessageListScrollContainer>
  );
}
