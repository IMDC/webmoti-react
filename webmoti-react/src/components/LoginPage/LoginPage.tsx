import { ChangeEvent, useState, FormEvent } from 'react';

import { styled } from '@mui/material/styles';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Grid, InputLabel, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import GoogleLogo from './google-logo.svg?react';
import { useAppState } from '../../state';
import IntroContainer from '../IntroContainer/IntroContainer';
import { SET_AUTH } from '../../clientEnv';

const PREFIX = 'LoginPage';

const classes = {
  googleButton: `${PREFIX}-googleButton`,
  errorMessage: `${PREFIX}-errorMessage`,
  gutterBottom: `${PREFIX}-gutterBottom`,
  passcodeContainer: `${PREFIX}-passcodeContainer`,
  submitButton: `${PREFIX}-submitButton`,
};

const StyledIntroContainer = styled(IntroContainer)(({ theme }) => ({
  [`& .${classes.googleButton}`]: {
    background: 'white',
    color: 'rgb(0, 94, 166)',
    borderRadius: '4px',
    border: '2px solid rgb(2, 122, 197)',
    margin: '1.8em 0 0.7em',
    textTransform: 'none',
    boxShadow: 'none',
    padding: '0.3em 1em',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    '&:hover': {
      background: 'white',
      boxShadow: 'none',
    },
  },

  [`& .${classes.errorMessage}`]: {
    color: 'red',
    display: 'flex',
    alignItems: 'center',
    margin: '1em 0 0.2em',
    '& svg': {
      marginRight: '0.4em',
    },
  },

  [`& .${classes.gutterBottom}`]: {
    marginBottom: '1em',
  },

  [`& .${classes.passcodeContainer}`]: {
    minHeight: '120px',
  },

  [`& .${classes.submitButton}`]: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
}));

export default function LoginPage() {
  const { signIn, user, isAuthReady } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<Error | null>(null);

  const isAuthEnabled = Boolean(SET_AUTH);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const login = () => {
    setAuthError(null);
    signIn?.(passcode)
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch((err) => setAuthError(err));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login();
  };

  if (user || !isAuthEnabled) {
    navigate('/', { replace: true });
    return null;
  }

  if (!isAuthReady) {
    return null;
  }

  return (
    <StyledIntroContainer>
      {SET_AUTH === 'firebase' && (
        <>
          <Typography variant="h5" className={classes.gutterBottom}>
            Sign in to join the classroom
          </Typography>
          <Typography variant="body1">Sign in using your TMU Google Account</Typography>
          <Button variant="contained" className={classes.googleButton} onClick={login} startIcon={<GoogleLogo />}>
            Sign in with Google
          </Button>
        </>
      )}
      {SET_AUTH === 'passcode' && (
        <>
          <Typography variant="h5" className={classes.gutterBottom}>
            Enter passcode to join a room
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container justifyContent="space-between">
              <div className={classes.passcodeContainer}>
                <InputLabel shrink htmlFor="input-passcode">
                  Passcode
                </InputLabel>
                <TextField
                  id="input-passcode"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPasscode(e.target.value)}
                  type="password"
                  variant="outlined"
                  size="small"
                />
                <div>
                  {authError && (
                    <Typography variant="caption" className={classes.errorMessage}>
                      <ErrorOutlineIcon />
                      {authError.message}
                    </Typography>
                  )}
                </div>
              </div>
            </Grid>
            <Grid container justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!passcode.length}
                className={classes.submitButton}
              >
                Submit
              </Button>
            </Grid>
          </form>
        </>
      )}
    </StyledIntroContainer>
  );
}
