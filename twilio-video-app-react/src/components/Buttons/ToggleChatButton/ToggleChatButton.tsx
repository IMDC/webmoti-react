import { useEffect, useState } from 'react';

import { Theme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import ChatIcon from '../../../icons/ChatIcon';

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
});

export default function ToggleChatButton() {
  const classes = useStyles();

  const { isChatWindowOpen, setIsChatWindowOpen, conversation, hasUnreadMessages } = useChatContext();
  const { setIsBackgroundSelectionOpen } = useVideoContext();

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

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
    if (conversation && !isChatWindowOpen) {
      const handleNewMessage = () => setShouldAnimate(true);
      conversation.on('messageAdded', handleNewMessage);
      return () => {
        conversation.off('messageAdded', handleNewMessage);
      };
    }
  }, [conversation, isChatWindowOpen]);

  return (
    <>
      <Button
        data-cy-chat-button
        onClick={toggleChatWindow}
        disabled={!conversation}
        startIcon={
          <div className={classes.iconContainer}>
            <ChatIcon />
            <div className={clsx(classes.ring, { [classes.animateRing]: shouldAnimate })} />
            <div className={clsx(classes.circle, { [classes.hasUnreadMessages]: hasUnreadMessages })} />
          </div>
        }
      >
        {isMobile ? '' : 'Chat'}
      </Button>
    </>
  );
}
