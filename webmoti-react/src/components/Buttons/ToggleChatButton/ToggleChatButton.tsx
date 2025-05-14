import { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { Button, useMediaQuery, useTheme } from '@mui/material';
import { Message } from '@twilio/conversations';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import ChatIcon from '../../../icons/ChatIcon';
import { checkSystemMsg, checkTTSAudioMsg } from '../../../utils';

export const ANIMATION_DURATION = 700;

const expand = keyframes({
  '0%': { transform: 'scale(0.1, 0.1)', opacity: 0 },
  '50%': { opacity: 1 },
  '100%': { transform: 'scale(1.4, 1.4)', opacity: 0 },
});

const IconContainer = styled('div')({
  position: 'relative',
  display: 'flex',
});

const Circle = styled('div')(({ theme }) => ({
  width: '10px',
  height: '10px',
  backgroundColor: '#027AC5',
  borderRadius: '50%',
  position: 'absolute',
  top: '-3px',
  left: '13px',
  opacity: 0,
  transition: `opacity ${ANIMATION_DURATION * 0.5}ms ease-in`,
}));

const Ring = styled('div')({
  border: '3px solid #027AC5',
  borderRadius: '30px',
  height: '14px',
  width: '14px',
  position: 'absolute',
  left: '11px',
  top: '-5px',
  opacity: 0,
});

const AnimatedRing = styled(Ring)({
  animation: `${expand} ${ANIMATION_DURATION}ms ease-out`,
  animationIterationCount: 1,
});

const StyledButton = styled(Button)({
  paddingLeft: 15,
  paddingRight: 15,
  minWidth: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export default function ToggleChatButton() {
  const { isChatWindowOpen, setIsChatWindowOpen, conversation, hasUnreadMessages } = useChatContext();

  const { setIsBackgroundSelectionOpen } = useVideoContext();

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <IconContainer sx={{ mr: isMobile ? 0 : 1 }}>
      <ChatIcon />
      {shouldAnimate && <AnimatedRing data-testid="chat-ring-animation" />}
      <Circle
        sx={{
          opacity: hasUnreadMessages ? 1 : 0,
        }}
        data-testid="unread-indicator"
      />
    </IconContainer>
  );

  return (
    <StyledButton
      data-cy-chat-button
      data-testid="toggle-chat-button"
      onClick={toggleChatWindow}
      disabled={!conversation}
      variant="outlined"
    >
      {isMobile ? icon : <>{icon} Chat</>}
    </StyledButton>
  );
}
