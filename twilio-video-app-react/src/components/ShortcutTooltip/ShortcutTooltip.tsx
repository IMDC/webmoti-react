import { Fade, Tooltip, withStyles } from '@material-ui/core';
import ShortcutIndicator from '../ShortcutIndicator/ShortcutIndicator';
import { ReactElement } from 'react';

const LightTooltip = withStyles((theme) => ({
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
}

export default function ShortcutTooltip({
  children,
  shortcut,
  isCtrlDown = false,
  isShiftDown = false,
}: ShortcutTooltipProps) {
  return (
    <LightTooltip
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 150 }}
      title={
        <ShortcutIndicator shortcut={shortcut} isCtrlDown={isCtrlDown} isShiftDown={isShiftDown} isInTooltip={true} />
      }
    >
      {children}
    </LightTooltip>
  );
}
