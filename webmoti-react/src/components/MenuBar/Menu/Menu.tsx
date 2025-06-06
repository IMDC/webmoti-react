import { useState, useRef } from 'react';

import CollaborationViewIcon from '@mui/icons-material/AccountBox';
import GridViewIcon from '@mui/icons-material/Apps';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreIcon from '@mui/icons-material/MoreVert';
// import SearchIcon from '@mui/icons-material/Search';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import {
  Button,
  Menu as MuiMenu,
  MenuItem,
  Typography,
  Grid,
  Tooltip,
  styled,
  useMediaQuery,
  Theme,
} from '@mui/material';
import { isSupported } from '@twilio/video-processors';
// import { VideoRoomMonitor } from '@twilio/video-room-monitor';

import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useFlipCameraToggle from '../../../hooks/useFlipCameraToggle/useFlipCameraToggle';
import useRoomState from '../../../hooks/useRoomState/useRoomState';
import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import BackgroundIcon from '../../../icons/BackgroundIcon';
import FlipCameraIcon from '../../../icons/FlipCameraIcon';
import InfoIconOutlined from '../../../icons/InfoIconOutlined';
import ScreenShareIcon from '../../../icons/ScreenShareIcon';
import SettingsIcon from '../../../icons/SettingsIcon';
import { useAppState } from '../../../state';
import { isMobile } from '../../../utils';
import AboutDialog from '../../AboutDialog/AboutDialog';
import LivekitConnectButton from '../../Buttons/LivekitConnectButton/LivekitConnectButton';
import DeviceSelectionDialog from '../../DeviceSelectionDialog/DeviceSelectionDialog';
import SetScheduleModal from '../../SetScheduleModal/SetScheduleModal';
import ViewScheduleModal from '../../ViewScheduleModal/ViewScheduleModal';

const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '1.5em',
  marginRight: '0.3em',
});

const ScreenShareBanner = styled(Grid)(({ theme }: { theme: Theme }) => ({
  position: 'fixed',
  zIndex: 8,
  bottom: `${theme.footerHeight}px`,
  [theme.breakpoints.down('lg')]: {
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
}));

export const SCREEN_SHARE_TEXT = 'Share Screen';
export const STOP_SCREEN_SHARE_TEXT = 'Stop Sharing Screen';
export const SHARE_IN_PROGRESS_TEXT = 'Cannot share screen when another user is sharing';
export const SHARE_NOT_SUPPORTED_TEXT = 'Screen sharing is not supported with this browser';

interface MenuProps {
  buttonClassName?: string;
}

export default function Menu({ buttonClassName }: MenuProps) {
  const isMobileBreakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const roomState = useRoomState();
  const screenShareParticipant = useScreenShareParticipant();
  const { setIsChatWindowOpen } = useChatContext();
  const { setIsAdmin } = useWebmotiVideoContext();
  const { setIsBackgroundSelectionOpen, isSharingScreen, toggleScreenShare } = useVideoContext();
  const { flipCameraDisabled, toggleFacingMode, flipCameraSupported } = useFlipCameraToggle();
  const { setIsGalleryViewActive, isGalleryViewActive } = useAppState();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [setScheduleOpen, setSetScheduleOpen] = useState(false);
  const [viewScheduleOpen, setViewScheduleOpen] = useState(false);

  const anchorRef = useRef<HTMLButtonElement>(null);
  const isReconnecting = roomState === 'reconnecting';
  const isScreenShareSupported = Boolean(navigator.mediaDevices?.getDisplayMedia);
  const isScreenShareDisabled = Boolean(screenShareParticipant) || !isScreenShareSupported || isReconnecting;

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const getTooltipMessage = () => {
    if (screenShareParticipant) return SHARE_IN_PROGRESS_TEXT;
    if (!isScreenShareSupported) return SHARE_NOT_SUPPORTED_TEXT;
    return '';
  };

  const handleAdminLogin = () => {
    const correctPassword = 'admin456';
    let password = prompt('Enter the admin password:');

    while (password !== correctPassword && password !== null) {
      password = prompt('Incorrect admin password! Please try again:');
    }

    if (password === correctPassword) setIsAdmin(true);
  };

  const menuItems = [
    {
      icon: <SettingsIcon />,
      label: 'Audio and Video Settings',
      onClick: () => {
        setSettingsOpen(true);
        setMenuOpen(false);
      },
    },
    ...(isSupported
      ? [
          {
            icon: <BackgroundIcon />,
            label: 'Backgrounds',
            onClick: () => {
              setIsBackgroundSelectionOpen(true);
              setIsChatWindowOpen(false);
              setMenuOpen(false);
            },
          },
        ]
      : []),
    ...(flipCameraSupported
      ? [
          {
            icon: <FlipCameraIcon />,
            label: 'Flip Camera',
            onClick: toggleFacingMode,
            disabled: flipCameraDisabled,
          },
        ]
      : []),
    // {
    //   icon: <SearchIcon style={{ fill: '#707578', width: '0.9em' }} />,
    //   label: 'Room Monitor',
    //   onClick: () => {
    //     VideoRoomMonitor.toggleMonitor();
    //     setMenuOpen(false);
    //   },
    // },
    {
      icon: <CalendarTodayIcon style={{ fill: '#707578', width: '0.9em' }} />,
      label: 'Set Schedule',
      onClick: () => {
        setSetScheduleOpen(true);
        setMenuOpen(false);
      },
    },
    {
      icon: <CalendarViewDayIcon style={{ fill: '#707578', width: '0.9em' }} />,
      label: 'View Schedule',
      onClick: () => {
        setViewScheduleOpen(true);
        setMenuOpen(false);
      },
    },
    ...(!isSharingScreen && !isMobile
      ? [
          {
            icon: <ScreenShareIcon />,
            label: SCREEN_SHARE_TEXT,
            onClick: () => {
              toggleScreenShare();
              setMenuOpen(false);
            },
            disabled: isScreenShareDisabled,
            tooltip: getTooltipMessage(),
          },
        ]
      : []),
    {
      icon: isGalleryViewActive ? (
        <CollaborationViewIcon style={{ fill: '#707578', width: '0.9em' }} />
      ) : (
        <GridViewIcon style={{ fill: '#707578', width: '0.9em' }} />
      ),
      label: isGalleryViewActive ? 'Speaker View' : 'Gallery View',
      onClick: () => {
        setIsGalleryViewActive((prev) => !prev);
        setMenuOpen(false);
      },
    },
    {
      icon: <InfoIconOutlined />,
      label: 'About',
      onClick: () => {
        setAboutOpen(true);
        setMenuOpen(false);
      },
    },
    {
      icon: <SupervisorAccountIcon style={{ fill: '#707578', width: '0.9em' }} />,
      label: 'Admin',
      onClick: () => {
        handleAdminLogin();
        setMenuOpen(false);
      },
    },
    {
      isCustomComponent: true,
      component: <LivekitConnectButton />,
    },
  ];

  return (
    <>
      {isSharingScreen && (
        <ScreenShareBanner container justifyContent="center" alignItems="center">
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={toggleScreenShare}>{STOP_SCREEN_SHARE_TEXT}</Button>
        </ScreenShareBanner>
      )}

      <Button
        onClick={toggleMenu}
        ref={anchorRef}
        className={buttonClassName}
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

      <MuiMenu
        open={menuOpen}
        anchorEl={anchorRef.current}
        onClose={() => setMenuOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{
          vertical: isMobileBreakpoint ? -55 : 'bottom',
          horizontal: 'center',
        }}
      >
        {menuItems.map((item, index) =>
          item.isCustomComponent ? (
            <MenuItem key={index} disableRipple disableTouchRipple>
              {item.component}
            </MenuItem>
          ) : (
            <MenuItem key={index} onClick={item.onClick} disabled={item.disabled}>
              {item.tooltip ? (
                <Tooltip
                  title={item.tooltip}
                  placement="top"
                  slotProps={{
                    popper: { disablePortal: true },
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconContainer>{item.icon}</IconContainer>
                    <Typography variant="body1">{item.label}</Typography>
                  </div>
                </Tooltip>
              ) : (
                <>
                  <IconContainer>{item.icon}</IconContainer>
                  <Typography variant="body1">{item.label}</Typography>
                </>
              )}
            </MenuItem>
          )
        )}
      </MuiMenu>

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
      <SetScheduleModal open={setScheduleOpen} onClose={() => setSetScheduleOpen(false)} />
      <ViewScheduleModal open={viewScheduleOpen} onClose={() => setViewScheduleOpen(false)} />
    </>
  );
}
