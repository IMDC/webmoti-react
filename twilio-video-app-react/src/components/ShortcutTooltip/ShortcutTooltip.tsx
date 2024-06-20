import { Tooltip, withStyles } from '@material-ui/core';
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
}

export default function ShortcutTooltip({ children, shortcut, isCtrlDown = false }: ShortcutTooltipProps) {
  return (
    <LightTooltip title={<ShortcutIndicator shortcut={shortcut} isCtrlDown={isCtrlDown} isInTooltip={true} />}>
      {children}
    </LightTooltip>
  );
}
