import { ReactElement } from 'react';

import { styled } from '@mui/material/styles';

import { Fade, Tooltip, Theme } from '@mui/material';

import ShortcutIndicator from '../ShortcutIndicator/ShortcutIndicator';

const PREFIX = 'ShortcutTooltip';

const classes = {
  tooltip: `${PREFIX}-tooltip`
};

const StyledLightTooltip = styled(LightTooltip)((
  {
    theme: Theme
  }
) => ({
  [`& .${classes.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
  }
}));

const LightTooltip = Tooltip;

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
    <StyledLightTooltip
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
    </StyledLightTooltip>
  );
}
