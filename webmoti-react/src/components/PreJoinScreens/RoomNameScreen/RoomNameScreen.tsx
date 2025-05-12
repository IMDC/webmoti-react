import { ChangeEvent, FormEvent } from 'react';

import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';

import { useAppState } from '../../../state';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  checkboxContainer: {
    margin: '1.5em 0',
  },
  errorText: {
    color: theme.palette.secondary.main,
    fontWeight: 'bold',
  },
}));

interface RoomNameScreenProps {
  name: string;
  roomName: string;
  setName: (name: string) => void;
  setRoomName: (roomName: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function RoomNameScreen({ name, roomName, setName, setRoomName, handleSubmit }: RoomNameScreenProps) {
  const classes = useStyles();
  const { user } = useAppState();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;

  return (
    <main>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join Classroom
      </Typography>
      <Typography variant="body1">Enter your first name and click continue</Typography>
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          {!hasUsername && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-user-name">
                Your First Name
              </InputLabel>
              <TextField
                id="input-user-name"
                variant="outlined"
                fullWidth
                size="small"
                value={name}
                onChange={handleNameChange}
              />
            </div>
          )}
          {/* hide room name field when running prod */}
          {/* (it confuses participants and we only need one room for now) */}
          {import.meta.env.MODE === 'development' && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-room-name">
                Room Name
              </InputLabel>
              <TextField
                autoCapitalize="false"
                id="input-room-name"
                variant="outlined"
                fullWidth
                size="small"
                value={roomName}
                onChange={handleRoomNameChange}
              />
            </div>
          )}
        </div>

        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={!name || !roomName}
            className={classes.continueButton}
          >
            Continue
          </Button>
        </Grid>
      </form>
    </main>
  );
}
