import { Card, CardContent, Typography, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
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
  isInTooltip?: boolean;
}

export default function ShortcutIndicator({
  shortcut,
  isCtrlDown = false,
  isShiftDown = false,
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
          {isCtrlDown ? '⌘' : ''}
          {isShiftDown ? '⇧' : ''}
          {shortcut}
        </Typography>
      </CardContent>
    </Card>
  );
}
