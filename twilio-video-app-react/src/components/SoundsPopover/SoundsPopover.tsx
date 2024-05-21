import { useState } from 'react';

import { Button, Popover } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import NotifyButton from '../Buttons/NotifyButton/NotifyButton';

export default function SoundsPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button onClick={handleButtonClick}>
        Sounds <ExpandMoreIcon />
      </Button>

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
