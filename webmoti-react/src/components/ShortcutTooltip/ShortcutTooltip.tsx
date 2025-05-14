import { ReactElement } from 'react';

import { Fade, Tooltip, Theme } from '@mui/material';
import { withStyles } from '@mui/styles';

import ShortcutIndicator from '../ShortcutIndicator/ShortcutIndicator';

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
  },
}))(Tooltip);

interface ShortcutTooltipProps {
  children: ReactElement;
  shortcut: string;
  isCtrlDown?: boolean;
  isShiftDown?: boolean;
  isAltDown?: boolean;
}

export default function ShortcutTooltip({
  children,
  shortcut,
  isCtrlDown = false,
  isShiftDown = false,
  isAltDown = false,
}: ShortcutTooltipProps) {
  return (
    <LightTooltip
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 150 }}
      title={
        <ShortcutIndicator
          shortcut={shortcut}
          isCtrlDown={isCtrlDown}
          isShiftDown={isShiftDown}
          isAltDown={isAltDown}
          isInTooltip={true}
        />
      }
    >
      {children}
    </LightTooltip>
  );
}
