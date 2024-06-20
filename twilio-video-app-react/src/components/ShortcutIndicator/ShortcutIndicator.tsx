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
}));

interface ShortcutIndicatorProps {
  shortcut: string;
  isCtrlDown?: boolean;
  isInTooltip?: boolean;
}

export default function ShortcutIndicator({
  shortcut,
  isCtrlDown = false,
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
        <Typography variant="caption">
          {isCtrlDown ? '⌘' : ''}
          {shortcut}
        </Typography>
      </CardContent>
    </Card>
  );
}
