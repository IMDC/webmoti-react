import { useEffect, useRef } from 'react';
import * as React from 'react';

import { styled } from '@mui/material/styles';

import { useMediaQuery, useTheme } from '@mui/material';
import clsx from 'clsx';
import { Room as IRoom, Participant } from 'twilio-video';

import useChatContext from '../../hooks/useChatContext/useChatContext';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import BackgroundSelectionDialog from '../BackgroundSelectionDialog/BackgroundSelectionDialog';
import { CaptionRenderer } from '../CaptionRenderer/CaptionRenderer';
import ChatWindow from '../ChatWindow/ChatWindow';
import { GalleryView } from '../GalleryView/GalleryView';
import MainParticipant from '../MainParticipant/MainParticipant';
import { MobileGalleryView } from '../MobileGalleryView/MobileGalleryView';
import { ParticipantAudioTracks } from '../ParticipantAudioTracks/ParticipantAudioTracks';
import ParticipantList from '../ParticipantList/ParticipantList';

const PREFIX = 'Room';

const classes = {
  container: `${PREFIX}-container`,
  rightDrawerOpen: `${PREFIX}-rightDrawerOpen`,
};

const Root = styled('div')(({ theme }) => {
  const totalMobileSidebarHeight = `${
    theme.sidebarMobileHeight + theme.sidebarMobilePadding * 2 + theme.participantBorderWidth
  }px`;
  return {
    [`&.${classes.container}`]: {
      position: 'relative',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: `1fr ${theme.sidebarWidth}px`,
      gridTemplateRows: '100%',
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: `100%`,
        gridTemplateRows: `calc(100% - ${totalMobileSidebarHeight}) ${totalMobileSidebarHeight}`,
      },
    },
    [`&.${classes.rightDrawerOpen}`]: {
      gridTemplateColumns: `1fr ${theme.sidebarWidth}px ${theme.rightDrawerWidth}px`,
      // this fixes chat window going down too far
      [theme.breakpoints.down('lg')]: {
        height: '95%',
      },
    },
  };
});

/**
 * This hook turns on speaker view when screensharing is active, regardless of if the
 * user was already using speaker view or gallery view. Once screensharing has ended, the user's
 * view will return to whatever they were using prior to screenshare starting.
 */

export function useSetSpeakerViewOnScreenShare(
  screenShareParticipant: Participant | undefined,
  room: IRoom | null,
  setIsGalleryViewActive: React.Dispatch<React.SetStateAction<boolean>>,
  isGalleryViewActive: boolean
) {
  const isGalleryViewActiveRef = useRef(isGalleryViewActive);

  // Save the user's view setting whenever they change to speaker view or gallery view:
  useEffect(() => {
    isGalleryViewActiveRef.current = isGalleryViewActive;
  }, [isGalleryViewActive]);

  useEffect(() => {
    if (screenShareParticipant && screenShareParticipant !== room!.localParticipant) {
      // When screensharing starts, save the user's previous view setting (speaker or gallery):
      const prevIsGalleryViewActive = isGalleryViewActiveRef.current;
      // Turn off gallery view so that the user can see the screen that is being shared:
      setIsGalleryViewActive(false);
      return () => {
        // If the user was using gallery view prior to screensharing, turn gallery view back on
        // once screensharing stops:
        if (prevIsGalleryViewActive) {
          setIsGalleryViewActive(prevIsGalleryViewActive);
        }
      };
    }
  }, [screenShareParticipant, setIsGalleryViewActive, room]);
}

export default function Room() {
  const { isChatWindowOpen } = useChatContext();
  const { isBackgroundSelectionOpen, room } = useVideoContext();
  const { isGalleryViewActive, setIsGalleryViewActive } = useAppState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const screenShareParticipant = useScreenShareParticipant();

  // Here we switch to speaker view when a participant starts sharing their screen, but
  // the user is still free to switch back to gallery view.
  useSetSpeakerViewOnScreenShare(screenShareParticipant, room, setIsGalleryViewActive, isGalleryViewActive);

  return (
    <Root
      data-testid="room-container"
      className={clsx(classes.container, {
        [classes.rightDrawerOpen]: isChatWindowOpen || isBackgroundSelectionOpen,
      })}
    >
      {/* 
        This ParticipantAudioTracks component will render the audio track for all participants in the room.
        It is in a separate component so that the audio tracks will always be rendered, and that they will never be 
        unnecessarily unmounted/mounted as the user switches between Gallery View and speaker View.
      */}
      <ParticipantAudioTracks />
      {isGalleryViewActive ? (
        isMobile ? (
          <MobileGalleryView data-testid="mobile-gallery-view" />
        ) : (
          <GalleryView data-testid="gallery-view" />
        )
      ) : (
        <>
          <MainParticipant data-testid="main-participant" />
          <ParticipantList data-testid="participant-list" />
        </>
      )}
      <ChatWindow />
      <BackgroundSelectionDialog />
      <CaptionRenderer />
    </Root>
  );
}
