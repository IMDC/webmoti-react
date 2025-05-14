import React from 'react';

import { styled } from '@mui/material/styles';

import { Typography, useMediaQuery, Theme, useTheme } from '@mui/material';

import { useLocation } from 'react-router-dom';

import Swoosh from './swoosh';
import UserMenu from './UserMenu/UserMenu';
import VideoLogo from './VideoLogo';
import { useAppState } from '../../state';

const PREFIX = 'IntroContainer';

const classes = {
  background: `${PREFIX}-background`,
  container: `${PREFIX}-container`,
  innerContainer: `${PREFIX}-innerContainer`,
  swooshContainer: `${PREFIX}-swooshContainer`,
  logoContainer: `${PREFIX}-logoContainer`,
  webmotiLogo: `${PREFIX}-webmotiLogo`,
  content: `${PREFIX}-content`,
  title: `${PREFIX}-title`,
  subtitle: `${PREFIX}-subtitle`
};

const Root = styled('div')((
  {
    theme: Theme
  }
) => ({
  [`&.${classes.background}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgb(40, 42, 43)',
    height: '100%',
  },

  [`& .${classes.container}`]: {
    position: 'relative',
    flex: '1',
  },

  [`& .${classes.innerContainer}`]: {
    display: 'flex',
    width: '888px',
    height: '379px',
    borderRadius: '8px',
    boxShadow: '0px 2px 4px 0px rgba(40, 42, 43, 0.3)',
    overflow: 'hidden',
    position: 'relative',
    margin: 'auto',
    [theme.breakpoints.down('md')]: {
      display: 'block',
      height: 'auto',
      width: 'calc(100% - 40px)',
      margin: 'auto',
      maxWidth: '400px',
    },
  },

  [`& .${classes.swooshContainer}`]: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: Swoosh,
    backgroundSize: 'cover',
    width: '296px',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      height: '100px',
      backgroundPositionY: '140px',
    },
  },

  [`& .${classes.logoContainer}`]: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    width: '210px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      position: 'relative',
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'center',
      '& svg': {
        height: '64px',
      },
    },
  },

  [`& .${classes.webmotiLogo}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '20px',
    opacity: '0.8',
  },

  [`& .${classes.content}`]: {
    background: 'white',
    width: '100%',
    padding: '3em 4em',
    flex: 1,
    [theme.breakpoints.down('md')]: {
      padding: '2em',
    },
  },

  [`& .${classes.title}`]: {
    color: 'white',
    margin: '1em 0 0',
    fontWeight: 'bold',
    [theme.breakpoints.down('md')]: {
      margin: 0,
      fontSize: '1.1rem',
    },
  },

  [`& .${classes.subtitle}`]: {
    color: 'lightgray',
    margin: '0.5em 0 1em',
    fontSize: '0.9rem',
    [theme.breakpoints.down('md')]: {
      fontSize: '0.8rem',
      margin: '0.25em 0 0.5em',
    },
  }
}));

interface IntroContainerProps {
  children: React.ReactNode;
}

const IntroContainer = (props: IntroContainerProps) => {

  const { user } = useAppState();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Root className={classes.background}>
      <img src="/favicon.svg" alt="Logo" className={classes.webmotiLogo} />
      {user && location.pathname !== '/login' && <UserMenu />}
      <div className={classes.container}>
        <div className={classes.innerContainer}>
          <div className={classes.swooshContainer}>
            <div className={classes.logoContainer}>
              <VideoLogo />
              <Typography variant="h6" className={classes.title}>
                WebMoti
              </Typography>

              {!isMobile && (
                <Typography variant="h6" className={classes.subtitle}>
                  Make Connections Easier
                </Typography>
              )}
            </div>
          </div>
          <div className={classes.content}>{props.children}</div>
        </div>
      </div>
    </Root>
  );
};

export default IntroContainer;
