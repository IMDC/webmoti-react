import React, { ChangeEvent, FormEvent, useContext } from 'react';
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
import { useAppState } from '../../../state';
import WebmotiVideoContext from '../../WebmotiVideoProvider';

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
}));

interface RoomNameScreenProps {
  name: string;
  roomName: string;
  isProfessor: boolean;
  isAdmin: boolean;
  setName: (name: string) => void;
  setRoomName: (roomName: string) => void;
  setIsProfessor: (isProfessor: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function RoomNameScreen({
  name,
  roomName,
  isProfessor,
  isAdmin,
  setName,
  setRoomName,
  setIsProfessor,
  setIsAdmin,
  handleSubmit,
}: RoomNameScreenProps) {
  const classes = useStyles();
  const { user } = useAppState();
  const webmotiContext = useContext(WebmotiVideoContext);

  if (!webmotiContext) {
    throw new Error('WebmotiVideoContext is undefined');
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const handleProfessorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsProfessor(event.target.checked);
    webmotiContext.setIsProfessor(event.target.checked);

    if (event.target.checked) {
      webmotiContext.setProfessorsName(name);
    }
  };

  const handleAdminChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsAdmin(event.target.checked);
    webmotiContext.setAdmin(event.target.checked);

    if (event.target.checked) {
      webmotiContext.setAdminName(name);
    }
  };

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;

  return (
    <>
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
            control={<Checkbox checked={isProfessor} onChange={handleProfessorChange} color="primary" />}
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
    </>
  );
}
