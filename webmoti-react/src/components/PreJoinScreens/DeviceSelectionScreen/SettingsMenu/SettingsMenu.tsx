import { useState, useRef } from 'react';
import { Button, Menu as MenuContainer, Typography, useMediaQuery, MenuItem, useTheme } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';

import AboutDialog from '../../../AboutDialog/AboutDialog';
import ConnectionOptionsDialog from '../../../ConnectionOptionsDialog/ConnectionOptionsDialog';
import DeviceSelectionDialog from '../../../DeviceSelectionDialog/DeviceSelectionDialog';
import SettingsIcon from '../../../../icons/SettingsIcon';
import { useAppState } from '../../../../state';

export default function SettingsMenu({ mobileButtonClass }: { mobileButtonClass?: string }) {
  const { roomType } = useAppState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [connectionSettingsOpen, setConnectionSettingsOpen] = useState(false);

  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      {isMobile ? (
        <Button
          ref={anchorRef}
          onClick={() => setMenuOpen(true)}
          startIcon={<MoreIcon />}
          className={mobileButtonClass}
          data-testid="settings-button"
        >
          More
        </Button>
      ) : (
        <Button
          ref={anchorRef}
          onClick={() => setMenuOpen(true)}
          startIcon={<SettingsIcon />}
          data-testid="settings-button"
        >
          Settings
        </Button>
      )}
      <MenuContainer
        open={menuOpen}
        onClose={() => setMenuOpen((isOpen) => !isOpen)}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: isMobile ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 0,
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={() => setAboutOpen(true)} data-testid="about-menuitem">
          <Typography variant="body1">About</Typography>
        </MenuItem>
        <MenuItem onClick={() => setDeviceSettingsOpen(true)} data-testid="device-settings-menuitem">
          <Typography variant="body1">Audio and Video Settings</Typography>
        </MenuItem>
        {roomType !== 'peer-to-peer' && roomType !== 'go' && (
          <MenuItem onClick={() => setConnectionSettingsOpen(true)} data-testid="connection-settings-menuitem">
            <Typography variant="body1">Connection Settings</Typography>
          </MenuItem>
        )}
      </MenuContainer>
      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          setMenuOpen(false);
        }}
      />
      <div data-testid="device-selection-dialog">
        <DeviceSelectionDialog
          open={deviceSettingsOpen}
          onClose={() => {
            setDeviceSettingsOpen(false);
            setMenuOpen(false);
          }}
        />
      </div>
      <div data-testid="connection-options-dialog">
        <ConnectionOptionsDialog
          open={connectionSettingsOpen}
          onClose={() => {
            setConnectionSettingsOpen(false);
            setMenuOpen(false);
          }}
        />
      </div>
    </>
  );
}
