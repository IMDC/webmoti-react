import FileDownloadIcon from '../../../../icons/FileDownloadIcon';
import { styled } from '@mui/material/styles';
import { Media } from '@twilio/conversations';

const PREFIX = 'MediaMessage';

const classes = {
  messageContainer: `${PREFIX}-messageContainer`,
  iconContainer: `${PREFIX}-iconContainer`,
  mediaInfo: `${PREFIX}-mediaInfo`,
  filename: `${PREFIX}-filename`,
  size: `${PREFIX}-size`
};

const Root = styled('div')({
  [`&.${classes.messageContainer}`]: {
    display: 'flex',
    padding: '0.9em 1.5em',
    margin: '0.6em 0',
    border: '2px solid #e4e7e9',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  [`& .${classes.iconContainer}`]: {
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${classes.mediaInfo}`]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: '1.5em',
    minWidth: 0,
    '& p': {
      margin: 0,
      fontSize: '12px',
    },
  },
  [`& .${classes.filename}`]: {
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  [`& .${classes.size}`]: {
    fontWeight: 400,
  },
});

interface MediaMessageProps {
  media: Media;
}

export function formatFileSize(bytes: number, suffixIndex = 0): string {
  const suffixes = ['bytes', 'KB', 'MB', 'GB'];
  if (bytes < 1000) return +bytes.toFixed(2) + ' ' + suffixes[suffixIndex];
  return formatFileSize(bytes / 1024, suffixIndex + 1);
}

export default function FileMessage({ media }: MediaMessageProps) {


  const handleClick = () => {
    media.getContentTemporaryUrl().then(url => {
      const anchorEl = document.createElement('a');

      anchorEl.href = url!;
      anchorEl.target = '_blank';
      anchorEl.rel = 'noopener';

      // setTimeout is needed in order to open files in iOS Safari.
      setTimeout(() => {
        anchorEl.click();
      });
    });
  };

  return (
    <Root className={classes.messageContainer} onClick={handleClick}>
      <div className={classes.iconContainer}>
        <FileDownloadIcon />
      </div>
      <div className={classes.mediaInfo}>
        <p className={classes.filename}>{media.filename}</p>
        <p className={classes.size}>{formatFileSize(media.size)} - Click to open</p>
      </div>
    </Root>
  );
}
