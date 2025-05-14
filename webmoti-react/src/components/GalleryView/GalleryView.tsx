import { useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';

import { Fireworks } from '@fireworks-js/react';
import type { FireworksHandlers } from '@fireworks-js/react';
import { IconButton, useTheme, Theme, useMediaQuery, Pagination } from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import clsx from 'clsx';

import { usePagination } from './usePagination/usePagination';
import { Events, GALLERY_VIEW_ASPECT_RATIO, GALLERY_VIEW_MARGIN } from '../../constants';
import useDominantSpeaker from '../../hooks/useDominantSpeaker/useDominantSpeaker';
import useGalleryViewLayout from '../../hooks/useGalleryViewLayout/useGalleryViewLayout';
import useParticipantsContext from '../../hooks/useParticipantsContext/useParticipantsContext';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import Participant from '../Participant/Participant';

const PREFIX = 'GalleryView';

const classes = {
  container: `${PREFIX}-container`,
  participantContainer: `${PREFIX}-participantContainer`,
  buttonContainer: `${PREFIX}-buttonContainer`,
  buttonContainerLeft: `${PREFIX}-buttonContainerLeft`,
  buttonContainerRight: `${PREFIX}-buttonContainerRight`,
  pagination: `${PREFIX}-pagination`,
  paginationButton: `${PREFIX}-paginationButton`,
  paginationContainer: `${PREFIX}-paginationContainer`
};

const Root = styled('div')((
  {
    theme: Theme
  }
) => ({
  [`&.${classes.container}`]: {
    background: theme.galleryViewBackgroundColor,
    position: 'relative',
    gridArea: '1 / 1 / 2 / 3',
  },

  [`& .${classes.participantContainer}`]: {
    position: 'absolute',
    display: 'flex',
    top: CONTAINER_GUTTER,
    right: CONTAINER_GUTTER,
    bottom: CONTAINER_GUTTER,
    left: CONTAINER_GUTTER,
    margin: '0 auto',
    alignContent: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  [`& .${classes.buttonContainer}`]: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  [`& .${classes.buttonContainerLeft}`]: {
    right: `calc(100% - ${CONTAINER_GUTTER})`,
    left: 0,
  },

  [`& .${classes.buttonContainerRight}`]: {
    right: 0,
    left: `calc(100% - ${CONTAINER_GUTTER})`,
  },

  [`& .${classes.pagination}`]: {
    '& .MuiPaginationItem-root': {
      color: 'white',
    },
  },

  [`& .${classes.paginationButton}`]: {
    color: 'black',
    background: 'rgba(255, 255, 255, 0.8)',
    width: '40px',
    height: '40px',
    '&:hover': {
      background: 'rgba(255, 255, 255)',
    },
  },

  [`& .${classes.paginationContainer}`]: {
    position: 'absolute',
    top: `calc(100% - ${CONTAINER_GUTTER})`,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));

const CONTAINER_GUTTER = '50px';

export function GalleryView() {

  const { maxGalleryViewParticipants } = useAppState();
  const { room } = useVideoContext();
  const { galleryViewParticipants } = useParticipantsContext();
  const dominantSpeaker = useDominantSpeaker(true);

  const { paginatedParticipants, setCurrentPage, currentPage, totalPages } = usePagination([
    room!.localParticipant,
    ...galleryViewParticipants,
  ]);

  const galleryViewLayoutParticipantCount =
    currentPage === 1 ? paginatedParticipants.length : maxGalleryViewParticipants;
  const { participantVideoWidth, containerRef } = useGalleryViewLayout(galleryViewLayoutParticipantCount);

  const participantWidth = `${participantVideoWidth}px`;
  const participantHeight = `${Math.floor(participantVideoWidth * GALLERY_VIEW_ASPECT_RATIO)}px`;

  const theme = useTheme();
  const isMdBreakpoint = useMediaQuery(theme.breakpoints.down('lg'));

  const fireworksRef = useRef<FireworksHandlers>(null);

  const displayFireworks = () => {
    if (!fireworksRef.current) return;

    if (!fireworksRef.current.isRunning) {
      fireworksRef.current.start();
    }

    // stop fireworks after 5 seconds
    setTimeout(() => {
      fireworksRef.current?.stop();
    }, 5000);
  };

  useEffect(() => {
    const handleFireworksEvent = () => {
      displayFireworks();
    };

    document.addEventListener(Events.Fireworks, handleFireworksEvent);
    return () => {
      document.removeEventListener(Events.Fireworks, handleFireworksEvent);
    };
  }, []);

  return (
    <Root className={classes.container}>
      <div className={clsx(classes.buttonContainer, classes.buttonContainerLeft)}>
        {!(currentPage === 1) && (
          <IconButton
            data-testid="pagination-prev-button"
            className={classes.paginationButton}
            onClick={() => setCurrentPage((page) => page - 1)}
            size="large">
            <ArrowBackIcon />
          </IconButton>
        )}
      </div>
      <div className={clsx(classes.buttonContainer, classes.buttonContainerRight)}>
        {!(currentPage === totalPages) && (
          <IconButton
            data-testid="pagination-next-button"
            className={classes.paginationButton}
            onClick={() => setCurrentPage((page) => page + 1)}
            size="large">
            <ArrowForwardIcon />
          </IconButton>
        )}
      </div>
      <div className={classes.paginationContainer}>
        {totalPages > 1 && (
          <Pagination
            data-testid="pagination"
            className={classes.pagination}
            page={currentPage}
            count={totalPages}
            onChange={(_, value) => setCurrentPage(value)}
            shape="rounded"
            color="primary"
            size="small"
            hidePrevButton
            hideNextButton
          />
        )}
      </div>
      <Fireworks
        ref={fireworksRef}
        options={{ opacity: 0.5 }}
        autostart={false}
        style={{
          top: isMdBreakpoint ? theme.mobileTopBarHeight : 0,
          left: 0,
          width: '100%',
          height: '100%',
          position: 'fixed',
          background: theme.galleryViewBackgroundColor,
        }}
      />
      <div className={classes.participantContainer} ref={containerRef} data-testid="participant-container">
        {paginatedParticipants.map((participant) => (
          <div
            key={participant.sid}
            style={{ width: participantWidth, height: participantHeight, margin: GALLERY_VIEW_MARGIN }}
          >
            <Participant
              participant={participant}
              isLocalParticipant={participant === room!.localParticipant}
              isDominantSpeaker={participant === dominantSpeaker}
            />
          </div>
        ))}
      </div>
    </Root>
  );
}
