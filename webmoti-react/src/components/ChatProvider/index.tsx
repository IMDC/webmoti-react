import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Client } from '@twilio/conversations';
import { Conversation, Message } from '@twilio/conversations/';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { checkSystemMsg } from '../../utils';

type ChatContextType = {
  isChatWindowOpen: boolean;
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void;
  connect: (token: string) => void;
  hasUnreadMessages: boolean;
  messages: Message[];
  conversation: Conversation | null;
};

export const ChatContext = createContext<ChatContextType>(null!);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { room, onError } = useVideoContext();
  const isChatWindowOpenRef = useRef(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [chatClient, setChatClient] = useState<Client>();

  const connect = useCallback(
    (token: string) => {
      const client = new Client(token);

      const handleClientInitialized = (state: string) => {
        if (state === 'initialized') {
          //@ts-expect-error: mock browser property
          window.chatClient = client;
          setChatClient(client);
        } else if (state === 'failed') {
          onError(new Error("There was a problem connecting to Twilio's conversation service."));
        }
      };

      client.on('stateChanged', handleClientInitialized);

      return () => {
        client.off('stateChanged', handleClientInitialized);
      };
    },
    [onError]
  );

  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: Message) => {
        if (!checkSystemMsg(message)) {
          setMessages((oldMessages) => [...oldMessages, message]);
        }
      };

      // don't show system messages when rejoining
      conversation.getMessages().then((newMessages) => {
        setMessages(newMessages.items.filter((message) => !checkSystemMsg(message)));
      });

      conversation.on('messageAdded', handleMessageAdded);
      return () => {
        conversation.off('messageAdded', handleMessageAdded);
      };
    }
  }, [conversation]);

  useEffect(() => {
    // If the chat window is closed and there are new messages, set hasUnreadMessages to true
    if (!isChatWindowOpenRef.current && messages.length) {
      setHasUnreadMessages(true);
    }
  }, [messages]);

  useEffect(() => {
    isChatWindowOpenRef.current = isChatWindowOpen;
    if (isChatWindowOpen) setHasUnreadMessages(false);
  }, [isChatWindowOpen]);

  useEffect(() => {
    if (room && chatClient) {
      chatClient
        .getConversationByUniqueName(room.sid)
        .then((newConversation) => {
          //@ts-expect-error: mock browser property
          window.chatConversation = newConversation;
          setConversation(newConversation);
        })
        .catch((e) => {
          console.error(e);
          onError(new Error('There was a problem getting the Conversation associated with this room.'));
        });
    }
  }, [room, chatClient, onError]);

  useEffect(() => {
    // leave conversation when closing tab
    const handleBeforeUnload = () => conversation?.leave();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [conversation]);

  return (
    <ChatContext.Provider
      value={{ isChatWindowOpen, setIsChatWindowOpen, connect, hasUnreadMessages, messages, conversation }}
    >
      {children}
    </ChatContext.Provider>
  );
};
