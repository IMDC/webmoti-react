import { ChangeEvent, FormEvent } from 'react';

import {
  Typography,
  makeStyles,
  TextField,
  Grid,
  Button,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Theme,
} from '@material-ui/core';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
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
  const correctProfessorPassword = 'professor123';
  const correctAdminPassword = 'admin456';

  const { isProfessor, isAdmin, setIsProfessor, setProfessorsName, setAdmin, setAdminName } = useWebmotiVideoContext();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const handleProfessorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      askProfessorPassword();
    } else {
      setIsProfessor(false);
      setProfessorsName('');
    }
  };

  const askProfessorPassword = () => {
    let password = prompt('Enter the professor password:');
    while (password !== correctProfessorPassword && password !== null) {
      password = prompt('Incorrect professor password! Please try again:');
    }
    if (password === correctProfessorPassword) {
      setIsProfessor(true);
      setProfessorsName(name);
    }
  };

  const handleAdminChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      askAdminPassword();
    } else {
      setAdmin(false);
      setAdminName('');
    }
  };

  const askAdminPassword = () => {
    let password = prompt('Enter the admin password:');
    while (password !== correctAdminPassword && password !== null) {
      password = prompt('Incorrect admin password! Please try again:');
    }
    if (password === correctAdminPassword) {
      setAdmin(true);
      setAdminName(name);
    }
  };

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;

  return (
    <main>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join a Room
      </Typography>
      <Typography variant="body1">
        {hasUsername
          ? "Enter the name of a room you'd like to join."
          : "Enter your name and the name of a room you'd like to join"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          {!hasUsername && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-user-name">
                Your Name
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
        </div>
        <div className={classes.checkboxContainer}>
          <FormControlLabel
            control={
              <Checkbox id="profCheckbox" checked={isProfessor} onChange={handleProfessorChange} color="primary" />
            }
            label="I am a professor"
          />
          <FormControlLabel
            control={<Checkbox checked={isAdmin} onChange={handleAdminChange} color="primary" />}
            label="I am an admin"
          />
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
