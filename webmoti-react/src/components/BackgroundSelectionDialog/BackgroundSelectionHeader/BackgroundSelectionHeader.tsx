import { styled } from '@mui/material/styles';

import CloseIcon from '../../../icons/CloseIcon';

const PREFIX = 'BackgroundSelectionHeader';

const classes = {
  container: `${PREFIX}-container`,
  text: `${PREFIX}-text`,
  closeBackgroundSelection: `${PREFIX}-closeBackgroundSelection`
};

const Root = styled('div')(() =>
  ({
    [`&.${classes.container}`]: {
      minHeight: '56px',
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

    [`& .${classes.closeBackgroundSelection}`]: {
      cursor: 'pointer',
      display: 'flex',
      background: 'transparent',
      border: '0',
      padding: '0.4em',
    }
  }));

interface BackgroundSelectionHeaderProps {
  onClose: () => void;
}

export default function BackgroundSelectionHeader({ onClose }: BackgroundSelectionHeaderProps) {

  return (
    <Root className={classes.container}>
      <div className={classes.text}>Backgrounds</div>
      <button className={classes.closeBackgroundSelection} onClick={onClose} aria-label="Close Backgrounds Panel">
        <CloseIcon />
      </button>
    </Root>
  );
}
