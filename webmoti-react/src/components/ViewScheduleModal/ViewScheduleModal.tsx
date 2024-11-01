import { useCallback, useEffect, useState } from 'react';

import {
  Backdrop,
  createStyles,
  Fade,
  Grid,
  IconButton,
  makeStyles,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import { Refresh } from '@material-ui/icons';

import { HTTPS_SERVER_URL } from '../../constants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  })
);

interface ViewScheduleModalProps {
  open: boolean;
  onClose: () => void;
}

interface Schedule {
  title: string;
  [key: string]: string;
}

export default function ViewScheduleModal({ open, onClose }: ViewScheduleModalProps) {
  const classes = useStyles();

  const [schedule, setSchedule] = useState<Schedule | null>(null);

  const { room } = useVideoContext();

  const getSchedule = useCallback(async () => {
    const name = room?.localParticipant?.identity || 'Participant';
    const response = await fetch(`${HTTPS_SERVER_URL}/schedule?identity=${name}`);

    if (response.status === 200) {
      const data = await response.json();
      setSchedule(data.schedule);
    } else {
      console.error('Error getting schedule');
    }
  }, [room?.localParticipant?.identity]);

  useEffect(() => {
    if (open) {
      getSchedule();
    }
  }, [open, getSchedule]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={classes.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item>
              <Typography variant="h6" component="span">
                Class Schedule
              </Typography>
            </Grid>

            <Grid item>
              <IconButton onClick={getSchedule}>
                <Refresh />
              </IconButton>
            </Grid>
          </Grid>

          <Typography variant="caption" component="span">
            Note: AI generated schedules are not always accurate
          </Typography>

          {schedule ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Event</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(schedule).map(
                    ([time, event]) =>
                      time !== 'title' && (
                        <TableRow key={time}>
                          <TableCell>{time}</TableCell>
                          <TableCell>{event}</TableCell>
                        </TableRow>
                      )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography style={{ marginTop: '20px' }}>No schedule for today</Typography>
          )}
        </div>
      </Fade>
    </Modal>
  );
}
