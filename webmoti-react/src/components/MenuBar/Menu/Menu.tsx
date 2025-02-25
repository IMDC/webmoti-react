import { useState, useRef } from 'react';

import {
  Button,
  styled,
  Theme,
  useMediaQuery,
  Menu as MenuContainer,
  MenuItem,
  Typography,
  makeStyles,
  createStyles,
  Grid,
  Tooltip,
} from '@material-ui/core';
import { CalendarToday, SupervisorAccount } from '@material-ui/icons';
import CollaborationViewIcon from '@material-ui/icons/AccountBox';
import GridViewIcon from '@material-ui/icons/Apps';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import { isSupported } from '@twilio/video-processors';
import { VideoRoomMonitor } from '@twilio/video-room-monitor';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useFlipCameraToggle from '../../../hooks/useFlipCameraToggle/useFlipCameraToggle';
// import useIsRecording from '../../../hooks/useIsRecording/useIsRecording';
import useRoomState from '../../../hooks/useRoomState/useRoomState';
import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import BackgroundIcon from '../../../icons/BackgroundIcon';
import FlipCameraIcon from '../../../icons/FlipCameraIcon';
import InfoIconOutlined from '../../../icons/InfoIconOutlined';
import ScreenShareIcon from '../../../icons/ScreenShareIcon';
import SettingsIcon from '../../../icons/SettingsIcon';
// import StartRecordingIcon from '../../../icons/StartRecordingIcon';
// import StopRecordingIcon from '../../../icons/StopRecordingIcon';
import { useAppState } from '../../../state';
import { isMobile } from '../../../utils';
import AboutDialog from '../../AboutDialog/AboutDialog';
import DeviceSelectionDialog from '../../DeviceSelectionDialog/DeviceSelectionDialog';
import SetScheduleModal from '../../SetScheduleModal/SetScheduleModal';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '1.5em',
  marginRight: '0.3em',
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    screenShareBanner: {
      position: 'fixed',
      zIndex: 8,
      bottom: `${theme.footerHeight}px`,
      [theme.breakpoints.down('md')]: {
        bottom: `${theme.mobileFooterHeight}px`,
      },
      left: 0,
      right: 0,
      height: '104px',
      background: 'rgba(0, 0, 0, 0.5)',
      '& h6': {
        color: 'white',
      },
      '& button': {
        background: 'white',
        color: theme.brand,
        border: `2px solid ${theme.brand}`,
        margin: '0 2em',
        '&:hover': {
          color: '#600101',
          border: `2px solid #600101`,
          background: '#FFE9E7',
        },
      },
    },
  })
);

export const SCREEN_SHARE_TEXT = 'Share Screen';
export const STOP_SCREEN_SHARE_TEXT = 'Stop Sharing Screen';
export const SHARE_IN_PROGRESS_TEXT = 'Cannot share screen when another user is sharing';
export const SHARE_NOT_SUPPORTED_TEXT = 'Screen sharing is not supported with this browser';

export default function Menu(props: { buttonClassName?: string }) {
  const isMobileBreakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const classes = useStyles();

  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';

  const screenShareParticipant = useScreenShareParticipant();
  const disableScreenShareButton = Boolean(screenShareParticipant);
  const isScreenShareSupported = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  const isScreenShareDisabled = disableScreenShareButton || !isScreenShareSupported;

  let tooltipMessage = '';

  if (disableScreenShareButton) {
    tooltipMessage = SHARE_IN_PROGRESS_TEXT;
  }

  if (!isScreenShareSupported) {
    tooltipMessage = SHARE_NOT_SUPPORTED_TEXT;
  }

  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    // isFetching,
    // updateRecordingRules,
    //  roomType,
    setIsGalleryViewActive,
    isGalleryViewActive,
  } = useAppState();
  const { setIsChatWindowOpen } = useChatContext();
  // const isRecording = useIsRecording();
  const {
    // room,
    setIsBackgroundSelectionOpen,
    isSharingScreen,
    toggleScreenShare,
  } = useVideoContext();

  const anchorRef = useRef<HTMLButtonElement>(null);
  const { flipCameraDisabled, toggleFacingMode, flipCameraSupported } = useFlipCameraToggle();

  const [openScheduleModal, setOpenScheduleModal] = useState(false);

  const { setIsAdmin } = useWebmotiVideoContext();

  const handleOpenScheduleModal = () => {
    setOpenScheduleModal(true);
    setMenuOpen(false);
  };

  const handleCloseScheduleModal = () => {
    setOpenScheduleModal(false);
  };

  const toggleMenu = () => {
    setMenuOpen((isOpen) => !isOpen);
  };

  useSetupHotkeys('ctrl+o', () => {
    toggleMenu();
  });

  // TODO: make this server side
  const correctAdminPassword = 'admin456';

  const askAdminPassword = () => {
    let password = prompt('Enter the admin password:');
    while (password !== correctAdminPassword && password !== null) {
      password = prompt('Incorrect admin password! Please try again:');
    }
    if (password === correctAdminPassword) {
      setIsAdmin(true);
    }
  };

  return (
    <>
      {isSharingScreen && (
        <Grid container justifyContent="center" alignItems="center" className={classes.screenShareBanner}>
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}

      <ShortcutTooltip shortcut="O" isCtrlDown>
        <Button
          onClick={toggleMenu}
          ref={anchorRef}
          className={props.buttonClassName}
          aria-label="More options"
          data-cy-more-button
        >
          {isMobileBreakpoint ? (
            <MoreIcon />
          ) : (
            <>
              More
              <ExpandMoreIcon />
            </>
          )}
        </Button>
      </ShortcutTooltip>

      <SetScheduleModal open={openScheduleModal} onClose={handleCloseScheduleModal} />

      <MenuContainer
        open={menuOpen}
        onClose={() => setMenuOpen((isOpen) => !isOpen)}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: isMobileBreakpoint ? -55 : 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => setSettingsOpen(true)}>
          <IconContainer>
            <SettingsIcon />
          </IconContainer>
          <Typography variant="body1">Audio and Video Settings</Typography>
        </MenuItem>
        {isSupported && (
          <MenuItem
            onClick={() => {
              setIsBackgroundSelectionOpen(true);
              setIsChatWindowOpen(false);
              setMenuOpen(false);
            }}
          >
            <IconContainer>
              <BackgroundIcon />
            </IconContainer>
            <Typography variant="body1">Backgrounds</Typography>
          </MenuItem>
        )}
        {flipCameraSupported && (
          <MenuItem disabled={flipCameraDisabled} onClick={toggleFacingMode}>
            <IconContainer>
              <FlipCameraIcon />
            </IconContainer>
            <Typography variant="body1">Flip Camera</Typography>
          </MenuItem>
        )}
        {/* {roomType !== 'peer-to-peer' && roomType !== 'go' && (
          <MenuItem
            disabled={isFetching}
            onClick={() => {
              setMenuOpen(false);
              if (isRecording) {
                updateRecordingRules(room!.sid, [{ type: 'exclude', all: true }]);
              } else {
                updateRecordingRules(room!.sid, [{ type: 'include', all: true }]);
              }
            }}
            data-cy-recording-button
          >
            <IconContainer>{isRecording ? <StopRecordingIcon /> : <StartRecordingIcon />}</IconContainer>
            <Typography variant="body1">{isRecording ? 'Stop' : 'Start'} Recording</Typography>
          </MenuItem>
        )} */}
        <MenuItem
          onClick={() => {
            VideoRoomMonitor.toggleMonitor();
            setMenuOpen(false);
          }}
        >
          <IconContainer>
            <SearchIcon style={{ fill: '#707578', width: '0.9em' }} />
          </IconContainer>
          <Typography variant="body1">Room Monitor</Typography>
        </MenuItem>

        <MenuItem onClick={handleOpenScheduleModal}>
          <IconContainer>
            <CalendarToday style={{ fill: '#707578', width: '0.9em' }} />
          </IconContainer>
          <Typography variant="body1">Set Schedule</Typography>
        </MenuItem>

        {!isSharingScreen && !isMobile && (
          <Tooltip
            title={tooltipMessage}
            placement="top"
            PopperProps={{ disablePortal: true }}
            style={{ cursor: isScreenShareDisabled ? 'not-allowed' : 'pointer' }}
          >
            <MenuItem onClick={toggleScreenShare} disabled={isReconnecting}>
              <IconContainer>
                <ScreenShareIcon />
              </IconContainer>
              <Typography variant="body1">{SCREEN_SHARE_TEXT}</Typography>
            </MenuItem>
          </Tooltip>
        )}

        <MenuItem
          onClick={() => {
            setIsGalleryViewActive((isGallery) => !isGallery);
            setMenuOpen(false);
          }}
        >
          <IconContainer>
            {isGalleryViewActive ? (
              <CollaborationViewIcon style={{ fill: '#707578', width: '0.9em' }} />
            ) : (
              <GridViewIcon style={{ fill: '#707578', width: '0.9em' }} />
            )}
          </IconContainer>
          <Typography variant="body1">{isGalleryViewActive ? 'Speaker View' : 'Gallery View'}</Typography>
        </MenuItem>

        <MenuItem onClick={() => setAboutOpen(true)}>
          <IconContainer>
            <InfoIconOutlined />
          </IconContainer>
          <Typography variant="body1">About</Typography>
        </MenuItem>

        <MenuItem onClick={askAdminPassword}>
          <IconContainer>
            <SupervisorAccount style={{ fill: '#707578', width: '0.9em' }} />
          </IconContainer>
          <Typography variant="body1">Admin</Typography>
        </MenuItem>
      </MenuContainer>
      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          setMenuOpen(false);
        }}
      />
      <DeviceSelectionDialog
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setMenuOpen(false);
        }}
      />
    </>
  );
}
