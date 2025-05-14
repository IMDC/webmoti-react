import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { Participant } from 'twilio-video';

import useParticipantIsReconnecting from '../../../hooks/useParticipantIsReconnecting/useParticipantIsReconnecting';


const PREFIX = 'ParticipantConnectionIndicator';

const classes = {
  indicator: `${PREFIX}-indicator`,
  isReconnecting: `${PREFIX}-isReconnecting`
};

const StyledTooltip = styled(Tooltip)({
  [`& .${classes.indicator}`]: {
    width: '10px',
    height: '10px',
    borderRadius: '100%',
    background: '#0c0',
    display: 'inline-block',
    marginRight: '3px',
  },
  [`& .${classes.isReconnecting}`]: {
    background: '#ffb100',
  },
});

export default function ParticipantConnectionIndicator({ participant }: { participant: Participant }) {
  const isReconnecting = useParticipantIsReconnecting(participant);

  return (
    <StyledTooltip title={isReconnecting ? 'Participant is reconnecting' : 'Participant is connected'}>
      <span
        className={clsx(classes.indicator, { [classes.isReconnecting]: isReconnecting })}
        data-testid="connection-indicator"
      ></span>
    </StyledTooltip>
  );
}
