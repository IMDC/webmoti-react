import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useHotkeys } from 'react-hotkeys-hook';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

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

  const endCall = () => {
    room!.disconnect();
    // also leave conversation to allow rejoin with same name
    conversation?.leave();
  };

  useHotkeys(
    'ctrl+d',
    (event) => {
      event.preventDefault();
      endCall();
    },
    { keyup: true }
  );

  return (
    <ShortcutTooltip shortcut="D" isCtrlDown>
      <Button onClick={endCall} className={clsx(classes.button, props.className)} data-cy-disconnect>
        Disconnect
      </Button>
    </ShortcutTooltip>
  );
}
