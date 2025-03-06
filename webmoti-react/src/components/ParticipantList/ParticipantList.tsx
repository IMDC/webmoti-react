import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import clsx from 'clsx';

import { WEBMOTI_CAMERA_1 } from '../../constants';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipantsContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import Participant from '../Participant/Participant';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      overflowY: 'auto',
      background: 'rgb(79, 83, 85)',
      gridArea: '1 / 2 / 1 / 3',
      zIndex: 5,
      [theme.breakpoints.down('sm')]: {
        gridArea: '2 / 1 / 3 / 3',
        overflowY: 'initial',
        overflowX: 'auto',
        display: 'flex',
      },
    },
    transparentBackground: {
      background: 'transparent',
    },
    scrollContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
    innerScrollContainer: {
      width: `calc(${theme.sidebarWidth}px - 3em)`,
      padding: '1.5em 0',
      [theme.breakpoints.down('sm')]: {
        width: 'auto',
        padding: `${theme.sidebarMobilePadding}px`,
        display: 'flex',
      },
    },
    arrowContainer: {
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'black',
      borderRadius: '50%',
    },
  })
);

export default function ParticipantList() {
  const classes = useStyles();
  const { room } = useVideoContext();
  const localParticipant = room!.localParticipant;
  const { speakerViewParticipants } = useParticipantsContext();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();
  const mainParticipant = useMainParticipant();
  const isRemoteParticipantScreenSharing = screenShareParticipant && screenShareParticipant !== localParticipant;

  const [showAll, setShowAll] = React.useState(false);

  if (speakerViewParticipants.length === 0) return null; // Don't render this component if there are no remote participants.

  const ArrowIcon = showAll ? ArrowUpwardIcon : ArrowDownwardIcon;

  return (
    <aside
      className={clsx(classes.container, {
        [classes.transparentBackground]: !isRemoteParticipantScreenSharing,
      })}
    >
      <div className={classes.scrollContainer}>
        <div className={classes.innerScrollContainer}>
          {showAll && <Participant participant={localParticipant} isLocalParticipant={true} />}
          {speakerViewParticipants.map((participant) => {
            const isSelected = participant === selectedParticipant;
            const hideParticipant = showAll
              ? participant === mainParticipant && participant !== screenShareParticipant && !isSelected
              : participant.identity !== WEBMOTI_CAMERA_1;
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
    </aside>
  );
}
