import React, { useState, useRef, useCallback } from 'react';

import { styled } from '@mui/material/styles';

import { Typography, Button, MenuItem, Link, Menu } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import UserAvatar from './UserAvatar/UserAvatar';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';

const PREFIX = 'UserMenu';

const classes = {
  userContainer: `${PREFIX}-userContainer`,
  userButton: `${PREFIX}-userButton`,
  logoutLink: `${PREFIX}-logoutLink`
};

const Root = styled('div')({
  [`&.${classes.userContainer}`]: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: '1em',
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${classes.userButton}`]: {
    color: 'white',
  },
  [`& .${classes.logoutLink}`]: {
    color: 'white',
    cursor: 'pointer',
    padding: '10px 20px',
  },
});

const UserMenu: React.FC = () => {

  const { user, signOut } = useAppState();
  const { localTracks } = useVideoContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = useCallback(() => {
    localTracks.forEach((track) => track.stop());
    signOut?.();
  }, [localTracks, signOut]);

  if (process.env.REACT_APP_SET_AUTH === 'passcode') {
    return (
      <Root className={classes.userContainer} data-testid="user-menu">
        <Link onClick={handleSignOut} className={classes.logoutLink} underline="hover">
          Logout
        </Link>
      </Root>
    );
  }

  if (process.env.REACT_APP_SET_AUTH === 'firebase') {
    return (
      <div className={classes.userContainer} data-testid="user-menu">
        <UserAvatar user={user} />
        <Button onClick={() => setMenuOpen((isOpen) => !isOpen)} ref={anchorRef} className={classes.userButton}>
          {user!.displayName}
          <ExpandMoreIcon />
        </Button>
        <Menu
          open={menuOpen}
          onClose={() => setMenuOpen((isOpen) => !isOpen)}
          anchorEl={anchorRef.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={handleSignOut}>
            <Typography variant="body1">Logout</Typography>
          </MenuItem>
        </Menu>
      </div>
    );
  }

  return null;
};

export default UserMenu;
