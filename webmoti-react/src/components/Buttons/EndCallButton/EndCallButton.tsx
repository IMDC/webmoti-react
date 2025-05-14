import { Button, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import clsx from 'clsx';
import CallEndIcon from '@mui/icons-material/CallEnd';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const PREFIX = 'EndCallButton';

const classes = {
  button: `${PREFIX}-button`,
};

const StyledButton = styled(Button)(({ theme }) => ({
  [`&.${classes.button}`]: {
    background: theme.brand,
    color: 'white',
    '&:hover': {
      background: '#000000',
    },
    paddingLeft: 5,
    paddingRight: 5,
    minWidth: 0,
  },
}));

export default function EndCallButton(props: { className?: string }) {
  const { room } = useVideoContext();
  const { conversation } = useChatContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const endCall = () => {
    room!.disconnect();
    // also leave conversation to allow rejoin with same name
    conversation?.leave();
  };

  return (
    <StyledButton onClick={endCall} className={clsx(classes.button, props.className)} data-cy-disconnect>
      {isMobile ? <CallEndIcon /> : 'Disconnect'}
    </StyledButton>
  );
}
