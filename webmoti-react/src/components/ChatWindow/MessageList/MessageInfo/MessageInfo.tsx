import { styled } from '@mui/material/styles';
const PREFIX = 'MessageInfo';

const classes = {
  messageInfoContainer: `${PREFIX}-messageInfoContainer`
};

const Root = styled('div')(() => ({
  [`&.${classes.messageInfoContainer}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.425em 0 0.083em',
    fontSize: '12px',
    color: '#606B85',
  }
}));

interface MessageInfoProps {
  author?: string;
  dateCreated: string;
  isLocalParticipant: boolean;
}

export default function MessageInfo({ author, dateCreated, isLocalParticipant }: MessageInfoProps) {


  return (
    <Root className={classes.messageInfoContainer}>
      <div>{isLocalParticipant && author ? `${author} (You)` : author}</div>
      <div>{dateCreated}</div>
    </Root>
  );
}
