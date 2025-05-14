import { Link } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import LinkifyIt from 'linkify-it';

const useStyles = makeStyles({
  messageContainer: {
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5em 0.8em 0.6em',
    margin: '0.3em 0 0',
    wordBreak: 'break-word',
    backgroundColor: '#E1E3EA',
    hyphens: 'auto',
    whiteSpace: 'pre-wrap',
  },
  isLocalParticipant: {
    backgroundColor: '#CCE4FF',
  },
  isTTSMsg: {
    backgroundColor: '#5A639C',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
});

interface TextMessageProps {
  body: string;
  isLocalParticipant: boolean;
  isTTSMsg?: boolean;
  onClick?: () => void;
}

const linkify = new LinkifyIt();

function addLinks(text: string) {
  const matches = linkify.match(text);
  if (!matches) return text;

  const results = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    results.push(text.slice(lastIndex, match.index));
    results.push(
      <Link target="_blank" rel="noreferrer" href={match.url} key={i}>
        {match.text}
      </Link>
    );
    lastIndex = match.lastIndex;
  });

  results.push(text.slice(lastIndex, text.length));

  return results;
}

export default function TextMessage({ body, isLocalParticipant, onClick, isTTSMsg = false }: TextMessageProps) {
  const classes = useStyles();

  return (
    <div>
      <div
        className={clsx(classes.messageContainer, {
          [classes.isLocalParticipant]: isLocalParticipant && !isTTSMsg,
          [classes.isTTSMsg]: isTTSMsg,
        })}
        onClick={onClick}
      >
        <div>{addLinks(body)}</div>
      </div>
    </div>
  );
}
