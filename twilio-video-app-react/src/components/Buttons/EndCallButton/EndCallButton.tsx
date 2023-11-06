import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';

import { Button } from '@material-ui/core';

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
    },
  })
);

export default function EndCallButton(props: { className?: string }) {
  const classes = useStyles();
  const { room } = useVideoContext();
  const { conversation } = useChatContext();

  return (
    <Button
      onClick={() => {
        room!.disconnect();
        // also leave conversation to allow rejoin with same name
        conversation?.leave();
      }}
      className={clsx(classes.button, props.className)}
      data-cy-disconnect
    >
      Disconnect
    </Button>
  );
}
