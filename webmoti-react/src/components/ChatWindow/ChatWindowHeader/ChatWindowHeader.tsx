import { makeStyles, createStyles } from '@material-ui/core/styles';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import CloseIcon from '../../../icons/CloseIcon';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      height: '56px',
      background: '#F4F4F6',
      borderBottom: '1px solid #E4E7E9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 1em',
    },
    text: {
      fontWeight: 'bold',
    },
    closeChatWindow: {
      cursor: 'pointer',
      display: 'flex',
      background: 'transparent',
      border: '0',
      padding: '0.4em',
    },
  })
);

interface ChatWindowHeaderProps {
  isTTSModeOn?: boolean;
}

export default function ChatWindowHeader({ isTTSModeOn = false }: ChatWindowHeaderProps) {
  const classes = useStyles();
  const { setIsChatWindowOpen } = useChatContext();

  return (
    <div className={classes.container}>
      <div className={classes.text}>{isTTSModeOn ? 'Question Text to Speech' : 'Chat'}</div>
      <button
        className={classes.closeChatWindow}
        onClick={() => setIsChatWindowOpen(false)}
        aria-label="Close chat window"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
