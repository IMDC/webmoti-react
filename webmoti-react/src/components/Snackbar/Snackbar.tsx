import React from 'react';

import { styled } from '@mui/material/styles';

import { IconButton, Typography, Snackbar as MUISnackbar, SnackbarCloseReason } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';

import ErrorIcon from '../../icons/ErrorIcon';
import InfoIcon from '../../icons/InfoIcon';
import WarningIcon from '../../icons/WarningIcon';

const PREFIX = 'Snackbar';

const classes = {
  container: `${PREFIX}-container`,
  contentContainer: `${PREFIX}-contentContainer`,
  iconContainer: `${PREFIX}-iconContainer`,
  headline: `${PREFIX}-headline`,
  error: `${PREFIX}-error`,
  warning: `${PREFIX}-warning`,
  info: `${PREFIX}-info`,
};

const StyledMUISnackbar = styled(MUISnackbar)(({ theme }) => ({
  [`& .${classes.container}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '400px',
    minHeight: '50px',
    background: 'white',
    padding: '1em',
    borderRadius: '3px',
    boxShadow: '0 12px 24px 4px rgba(40,42,43,0.2)',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },

  [`& .${classes.contentContainer}`]: {
    display: 'flex',
    lineHeight: 1.8,
  },

  [`& .${classes.iconContainer}`]: {
    display: 'flex',
    padding: '0 1.3em 0 0.3em',
    transform: 'translateY(3px)',
  },

  [`& .${classes.headline}`]: {
    fontWeight: 'bold',
  },

  [`& .${classes.error}`]: {
    borderLeft: '4px solid #D61F1F',
  },

  [`& .${classes.warning}`]: {
    borderLeft: '4px solid #E46216',
  },

  [`& .${classes.info}`]: {
    borderLeft: '4px solid #0263e0',
  },
}));

interface SnackbarProps {
  headline: string;
  message: string | React.ReactNode;
  variant?: 'error' | 'warning' | 'info';
  open: boolean;
  handleClose?: () => void;
}

export default function Snackbar({ headline, message, variant, open, handleClose }: SnackbarProps) {
  const handleOnClose = (_: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    handleClose?.();
  };

  return (
    <StyledMUISnackbar
      data-testid="mui-snackbar"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={open}
      onClose={handleOnClose}
      autoHideDuration={10000}
    >
      <div
        className={clsx(classes.container, {
          [classes.error]: variant === 'error',
          [classes.warning]: variant === 'warning',
          [classes.info]: variant === 'info',
        })}
      >
        <div className={classes.contentContainer}>
          <div className={classes.iconContainer}>
            {variant === 'warning' && <WarningIcon />}
            {variant === 'error' && <ErrorIcon />}
            {variant === 'info' && <InfoIcon />}
          </div>
          <div>
            <Typography variant="body1" className={classes.headline} component="span">
              {headline}
            </Typography>
            <Typography variant="body1" component="span">
              {' '}
              {message}
            </Typography>
          </div>
        </div>
        <div>
          {handleClose && (
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>
    </StyledMUISnackbar>
  );
}
