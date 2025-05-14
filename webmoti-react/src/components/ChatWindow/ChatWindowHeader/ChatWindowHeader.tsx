import { styled } from '@mui/material/styles';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import CloseIcon from '../../../icons/CloseIcon';

const PREFIX = 'ChatWindowHeader';

const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  closeChatWindow: `${PREFIX}-closeChatWindow`
};

const Root = styled('div')(() => ({
  [`&.${classes.container}`]: {
    height: '56px',
    background: '#F4F4F6',
    borderBottom: '1px solid #E4E7E9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1em',
  },

  [`& .${classes.text}`]: {
    fontWeight: 'bold',
  },

  [`& .${classes.closeChatWindow}`]: {
    cursor: 'pointer',
    display: 'flex',
    background: 'transparent',
    border: '0',
    padding: '0.4em',
  }
}));

interface ChatWindowHeaderProps {
  isTTSModeOn?: boolean;
}

export default function ChatWindowHeader({ isTTSModeOn = false }: ChatWindowHeaderProps) {

  const { setIsChatWindowOpen } = useChatContext();

  return (
    <Root className={classes.container}>
      <div className={classes.text}>{isTTSModeOn ? 'Question Text to Speech' : 'Chat'}</div>
      <button
        className={classes.closeChatWindow}
        onClick={() => setIsChatWindowOpen(false)}
        aria-label="Close chat window"
      >
        <CloseIcon />
      </button>
    </Root>
  );
}
