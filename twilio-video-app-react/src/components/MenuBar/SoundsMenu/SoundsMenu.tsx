import { useRef, useState } from 'react';

import { Button, Popover } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import NotifyButton from '../../Buttons/NotifyButton/NotifyButton';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function SoundsMenu() {
  const openBtnRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  useSetupHotkeys('ctrl+s', () => {
    if (anchorEl) {
      handlePopoverClose();
    } else {
      setAnchorEl(openBtnRef.current);
    }
  });

  return (
    <>
      <ShortcutTooltip shortcut="S" isCtrlDown>
        <Button ref={openBtnRef} onClick={handleButtonClick}>
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
