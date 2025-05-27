import { useState } from 'react';

import { styled } from '@mui/material/styles';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import clsx from 'clsx';

import { WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipantsContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import Participant from '../Participant/Participant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

const PREFIX = 'ParticipantList';

const classes = {
  container: `${PREFIX}-container`,
  transparentBackground: `${PREFIX}-transparentBackground`,
  scrollContainer: `${PREFIX}-scrollContainer`,
  innerScrollContainer: `${PREFIX}-innerScrollContainer`,
  arrowContainer: `${PREFIX}-arrowContainer`,
};

const Root = styled('aside')(({ theme }) => ({
  [`&.${classes.container}`]: {
    overflowY: 'auto',
    background: 'rgb(79, 83, 85)',
    gridArea: '1 / 2 / 1 / 3',
    zIndex: 5,
    [theme.breakpoints.down('md')]: {
      gridArea: '2 / 1 / 3 / 3',
      overflowY: 'initial',
      overflowX: 'auto',
      display: 'flex',
    },
  },

  [`&.${classes.transparentBackground}`]: {
    background: 'transparent',
  },

  [`& .${classes.scrollContainer}`]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },

  [`& .${classes.innerScrollContainer}`]: {
    width: `calc(${theme.sidebarWidth}px - 3em)`,
    padding: '1.5em 0',
    [theme.breakpoints.down('md')]: {
      width: 'auto',
      padding: `${theme.sidebarMobilePadding}px`,
      display: 'flex',
    },
  },

  [`& .${classes.arrowContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'black',
    borderRadius: '50%',
    // allow space under the arrow for scrolling to it when list is large
    marginBottom: `${theme.footerHeight}px`,
  },
}));

export default function ParticipantList() {
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const { speakerViewParticipants } = useParticipantsContext();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();
  const mainParticipant = useMainParticipant();
  const isRemoteParticipantScreenSharing = screenShareParticipant && screenShareParticipant !== localParticipant;

  const [showAll, setShowAll] = useState(false);

  // Don't render this component if there are no remote participants.
  if (speakerViewParticipants.length === 0) return null;

  const ArrowIcon = showAll ? ArrowUpwardIcon : ArrowDownwardIcon;

  // only show camera 1 in list when camera 2 is main and vice versa
  const allowedIdentitiesInFiltered =
    mainParticipant.identity === WEBMOTI_CAMERA_1
      ? [WEBMOTI_CAMERA_2]
      : mainParticipant.identity === WEBMOTI_CAMERA_2
        ? [WEBMOTI_CAMERA_1]
        : [WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2];

  return (
    <Root
      className={clsx(classes.container, {
        [classes.transparentBackground]: !isRemoteParticipantScreenSharing,
      })}
    >
      <div className={classes.scrollContainer}>
        <div className={classes.innerScrollContainer}>
          {showAll && <Participant participant={localParticipant} isLocalParticipant={true} />}
          {speakerViewParticipants.map((participant) => {
            const isSelected = participant === selectedParticipant;
            const isMainParticipant = participant === mainParticipant;
            const isScreenSharing = participant === screenShareParticipant;

            // show all mode will show all participants except the selected/main or screen share participant
            const shouldHideInShowAll = (isSelected || isMainParticipant) && !isScreenSharing;
            // filtered mode will only show board-view and student-view participants
            const shouldHideInFiltered = !allowedIdentitiesInFiltered.includes(participant.identity);
            const hideParticipant = showAll ? shouldHideInShowAll : shouldHideInFiltered;

            return (
              <Participant
                key={participant.sid}
                participant={participant}
                isSelected={isSelected}
                onClick={() => setSelectedParticipant(participant)}
                hideParticipant={hideParticipant}
              />
            );
          })}
        </div>
        <div className={classes.arrowContainer}>
          <ArrowIcon onClick={() => setShowAll(!showAll)} style={{ cursor: 'pointer', color: 'white' }} />
        </div>
      </div>
    </Root>
  );
}
