import { Button, useMediaQuery, useTheme } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import CallEndIcon from '@material-ui/icons/CallEnd';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      background: theme.brand,
      color: 'white',
      '&:hover': {
        background: '#000000',
      },
      paddingLeft: 5,
      paddingRight: 5,
      minWidth: 0,
    },
  })
);

export default function EndCallButton(props: { className?: string }) {
  const classes = useStyles();
  const { room } = useVideoContext();
  const { conversation } = useChatContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const endCall = () => {
    room!.disconnect();
    // also leave conversation to allow rejoin with same name
    conversation?.leave();
  };

  return (
    <Button onClick={endCall} className={clsx(classes.button, props.className)} data-cy-disconnect>
      {isMobile ? <CallEndIcon /> : 'Disconnect'}
    </Button>
  );
}
