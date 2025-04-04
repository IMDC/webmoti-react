import { useEffect, useState } from 'react';

import { useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Message } from '@twilio/conversations';
import clsx from 'clsx';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import ChatIcon from '../../../icons/ChatIcon';
import { checkSystemMsg, checkTTSAudioMsg } from '../../../utils';

export const ANIMATION_DURATION = 700;

const useStyles = makeStyles({
  iconContainer: {
    position: 'relative',
    display: 'flex',
  },
  circle: {
    width: '10px',
    height: '10px',
    backgroundColor: '#027AC5',
    borderRadius: '50%',
    position: 'absolute',
    top: '-3px',
    left: '13px',
    opacity: 0,
    transition: `opacity ${ANIMATION_DURATION * 0.5}ms ease-in`,
  },
  hasUnreadMessages: {
    opacity: 1,
  },
  ring: {
    border: '3px solid #027AC5',
    borderRadius: '30px',
    height: '14px',
    width: '14px',
    position: 'absolute',
    left: '11px',
    top: '-5px',
    opacity: 0,
  },
  animateRing: {
    animation: `$expand ${ANIMATION_DURATION}ms ease-out`,
    animationIterationCount: 1,
  },
  '@keyframes expand': {
    '0%': {
      transform: 'scale(0.1, 0.1)',
      opacity: 0,
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1.4, 1.4)',
      opacity: 0,
    },
  },
  btn: {
    paddingLeft: 15,
    paddingRight: 15,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 8,
  },
});

export default function ToggleChatButton() {
  const classes = useStyles();

  const { isChatWindowOpen, setIsChatWindowOpen, conversation, hasUnreadMessages } = useChatContext();

  const { setIsBackgroundSelectionOpen } = useVideoContext();

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleChatWindow = () => {
    setIsChatWindowOpen(!isChatWindowOpen);
    setIsBackgroundSelectionOpen(false);
  };

  useEffect(() => {
    if (shouldAnimate) {
      setTimeout(() => setShouldAnimate(false), ANIMATION_DURATION);
    }
  }, [shouldAnimate]);

  useEffect(() => {
    if (conversation) {
      const handleNewMessage = async (message: Message) => {
        // don't show new msg animation for system messages
        if (checkSystemMsg(message)) {
          return;
        }

        if (!isChatWindowOpen) {
          setShouldAnimate(true);
        }

        if (!checkTTSAudioMsg(message) || !message.attachedMedia?.length) {
          return;
        }

        const tts = message.attachedMedia[0];
        const audioUrl = await tts.getContentTemporaryUrl();
        if (audioUrl) {
          new Audio(audioUrl).play();
        }
      };

      conversation.on('messageAdded', handleNewMessage);
      return () => {
        conversation.off('messageAdded', handleNewMessage);
      };
    }
  }, [conversation, isChatWindowOpen]);

  const icon = (
    <div
      className={clsx(classes.iconContainer, {
        [classes.iconSpacing]: !isMobile,
      })}
    >
      <ChatIcon />
      <div className={clsx(classes.ring, { [classes.animateRing]: shouldAnimate })} />
      <div className={clsx(classes.circle, { [classes.hasUnreadMessages]: hasUnreadMessages })} />
    </div>
  );

  return (
    <Button
      data-cy-chat-button
      onClick={toggleChatWindow}
      disabled={!conversation}
      variant="outlined"
      className={classes.btn}
    >
      {isMobile ? icon : <>{icon} Chat</>}
    </Button>
  );
}
