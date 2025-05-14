import React from 'react';

import { styled } from '@mui/material/styles';

import { Container, Link, Typography, Paper, Grid } from '@mui/material';
import Video from 'twilio-video';

const PREFIX = 'UnsupportedBrowserWarning';

const classes = {
  container: `${PREFIX}-container`,
  paper: `${PREFIX}-paper`,
  heading: `${PREFIX}-heading`
};

const StyledContainer = styled(Container)({
  [`& .${classes.container}`]: {
    marginTop: '2.5em',
  },
  [`& .${classes.paper}`]: {
    padding: '1em',
  },
  [`& .${classes.heading}`]: {
    marginBottom: '0.4em',
  },
});

export default function UnsupportedBrowserWarning({ children }: { children: React.ReactElement }) {


  if (!Video.isSupported) {
    return (
      <StyledContainer>
        <Grid container justifyContent="center" className={classes.container}>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              <Typography variant="h4" className={classes.heading}>
                Browser or context not supported
              </Typography>
              <Typography>
                Please open this application in one of the{' '}
                <Link
                  href="https://www.twilio.com/docs/video/javascript#supported-browsers"
                  target="_blank"
                  rel="noopener"
                  underline="hover">
                  supported browsers
                </Link>
                .
                <br />
                If you are using a supported browser, please ensure that this app is served over a{' '}
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts"
                  target="_blank"
                  rel="noopener"
                  underline="hover">
                  secure context
                </Link>{' '}
                (e.g. https or localhost).
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </StyledContainer>
    );
  }

  return children;
}
