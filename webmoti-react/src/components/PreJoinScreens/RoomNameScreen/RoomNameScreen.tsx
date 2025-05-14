import { ChangeEvent, FormEvent } from 'react';

import { styled } from '@mui/material/styles';

import { Typography, TextField, Grid, Button, InputLabel } from '@mui/material';

import { useAppState } from '../../../state';

const PREFIX = 'RoomNameScreen';

const classes = {
  gutterBottom: `${PREFIX}-gutterBottom`,
  inputContainer: `${PREFIX}-inputContainer`,
  textFieldContainer: `${PREFIX}-textFieldContainer`,
  continueButton: `${PREFIX}-continueButton`,
  checkboxContainer: `${PREFIX}-checkboxContainer`,
  errorText: `${PREFIX}-errorText`,
};

const Root = styled('main')(({ theme }) => ({
  [`& .${classes.gutterBottom}`]: {
    marginBottom: '1em',
  },

  [`& .${classes.inputContainer}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('md')]: {
      margin: '1.5em 0 2em',
    },
  },

  [`& .${classes.textFieldContainer}`]: {
    width: '100%',
  },

  [`& .${classes.continueButton}`]: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },

  [`& .${classes.checkboxContainer}`]: {
    margin: '1.5em 0',
  },

  [`& .${classes.errorText}`]: {
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
  const { user } = useAppState();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;

  return (
    <Root>
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
          {process.env.NODE_ENV === 'development' && (
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
    </Root>
  );
}
