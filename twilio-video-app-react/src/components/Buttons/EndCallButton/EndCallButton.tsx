import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
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

  useSetupHotkeys('ctrl+shift+d', () => {
    endCall();
  });

  return (
    <ShortcutTooltip shortcut="D" isCtrlDown isShiftDown>
      <Button onClick={endCall} className={clsx(classes.button, props.className)} data-cy-disconnect>
        Disconnect
      </Button>
    </ShortcutTooltip>
  );
}
