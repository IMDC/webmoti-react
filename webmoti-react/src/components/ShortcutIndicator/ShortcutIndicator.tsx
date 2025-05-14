import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';

const PREFIX = 'ShortcutIndicator';

const classes = {
  card: `${PREFIX}-card`,
  beforeMargin: `${PREFIX}-beforeMargin`,
  extraMargin: `${PREFIX}-extraMargin`,
  cardContent: `${PREFIX}-cardContent`,
  shortcutText: `${PREFIX}-shortcutText`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  [`&.${classes.card}`]: {
    height: 20,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },

  [`&.${classes.beforeMargin}`]: {
    marginLeft: 5,
  },

  [`&.${classes.extraMargin}`]: {
    margin: '4px',
  },

  [`& .${classes.cardContent}`]: {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
  },

  [`& .${classes.shortcutText}`]: {
    letterSpacing: '0.1em',
  },
}));

interface ShortcutIndicatorProps {
  shortcut: string;
  isCtrlDown?: boolean;
  isShiftDown?: boolean;
  isAltDown?: boolean;
  isInTooltip?: boolean;
}

export default function ShortcutIndicator({
  shortcut,
  isCtrlDown = false,
  isShiftDown = false,
  isAltDown = false,
  isInTooltip = false,
}: ShortcutIndicatorProps) {
  return (
    <StyledCard
      className={clsx(classes.card, {
        [classes.beforeMargin]: !isInTooltip,
        [classes.extraMargin]: isInTooltip,
      })}
      variant="outlined"
    >
      <CardContent className={classes.cardContent}>
        <Typography variant="caption" className={classes.shortcutText}>
          {isCtrlDown ? 'Ctrl+' : ''}
          {isShiftDown ? 'Shift+' : ''}
          {isAltDown ? 'Alt+' : ''}
          {shortcut}
        </Typography>
      </CardContent>
    </StyledCard>
  );
}
