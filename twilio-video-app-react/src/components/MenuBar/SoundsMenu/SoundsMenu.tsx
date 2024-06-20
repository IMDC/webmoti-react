import { useState } from 'react';

import { Button, Popover } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import NotifyButton from '../../Buttons/NotifyButton/NotifyButton';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function SoundsMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ShortcutTooltip shortcut="S" isCtrlDown>
        <Button onClick={handleButtonClick}>
          Sounds <ExpandMoreIcon />
        </Button>
      </ShortcutTooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <div style={{ padding: '16px' }}>
          <NotifyButton />
        </div>
      </Popover>
    </>
  );
}
