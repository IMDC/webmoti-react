import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { Theme, useMediaQuery, Dialog, DialogContent } from '@material-ui/core';
import ChatIcon from '../../../icons/ChatIcon';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

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
  popUp: {
    textAlign: 'center',
    marginTop: '30px',
    padding: '24px',
    paddingLeft: '80px',
    paddingRight: '80px',
  },
  closeButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px',
    position: 'absolute',
    top: '8px',
    right: '8px',
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
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const { isChatWindowOpen, setIsChatWindowOpen, conversation, hasUnreadMessages } = useChatContext();
  const { setIsBackgroundSelectionOpen } = useVideoContext();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const toggleChatWindow = () => {
    setIsChatWindowOpen(!isChatWindowOpen);
    setIsBackgroundSelectionOpen(false);
  };

  const handlePopUpClose = () => {
    setIsPopUpOpen(false);
  };

  useEffect(() => {
    if (shouldAnimate) {
      setIsPopUpOpen(true);
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

      {/* Pop-up */}
      <Dialog open={isPopUpOpen} onClose={handlePopUpClose}>
        <DialogContent className={clsx(classes.popUp)}>
          <div className={classes.closeButton}>
            <Button color="primary" onClick={handlePopUpClose}>
              Close
            </Button>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>New Message Received!</div>
          <div style={{ marginBottom: '30px' }}>Open the chat to respond.</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
