import { styled } from '@mui/material/styles';
import { Participant } from 'twilio-video';

import useParticipantNetworkQualityLevel from '../../hooks/useParticipantNetworkQualityLevel/useParticipantNetworkQualityLevel';

const PREFIX = 'NetworkQualityLevel';

const classes = {
  outerContainer: `${PREFIX}-outerContainer`,
  innerContainer: `${PREFIX}-innerContainer`
};

const Root = styled('div')({
  [`&.${classes.outerContainer}`]: {
    width: '2em',
    height: '2em',
    padding: '0.9em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  [`& .${classes.innerContainer}`]: {
    display: 'flex',
    alignItems: 'flex-end',
    '& div': {
      width: '2px',
      marginRight: '1px',
      '&:not(:last-child)': {
        borderRight: 'none',
      },
    },
  },
});

const STEP = 3;
const BARS_ARRAY = [0, 1, 2, 3, 4];

export default function NetworkQualityLevel({ participant }: { participant: Participant }) {

  const networkQualityLevel = useParticipantNetworkQualityLevel(participant);

  if (networkQualityLevel === null) return null;

  return (
    <Root className={classes.outerContainer}>
      <div className={classes.innerContainer}>
        {BARS_ARRAY.map(level => (
          <div
            key={level}
            style={{
              height: `${STEP * (level + 1)}px`,
              background: networkQualityLevel > level ? 'white' : 'rgba(255, 255, 255, 0.2)',
            }}
          />
        ))}
      </div>
    </Root>
  );
}
