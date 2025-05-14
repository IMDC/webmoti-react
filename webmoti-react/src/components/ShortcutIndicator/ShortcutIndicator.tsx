import { Card, CardContent, Typography, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    height: 20,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  beforeMargin: {
    marginLeft: 5,
  },
  extraMargin: {
    margin: '4px',
  },
  cardContent: {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
  },
  shortcutText: {
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
  const classes = useStyles();

  return (
    <Card
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
    </Card>
  );
}
