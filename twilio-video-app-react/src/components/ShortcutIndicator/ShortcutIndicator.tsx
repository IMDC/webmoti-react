import { Card, CardContent, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  card: {
    height: 20,
    marginLeft: 10,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  cardContent: {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
  },
}));

export default function ShortcutIndicator() {
  const classes = useStyles();

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent className={classes.cardContent}>
        <Typography variant="caption">⌘K</Typography>
      </CardContent>
    </Card>
  );
}
