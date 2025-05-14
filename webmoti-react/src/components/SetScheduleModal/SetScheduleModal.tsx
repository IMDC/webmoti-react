import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';

import { Backdrop, Button, CircularProgress, Fade, Grid, Modal, TextField, Typography } from '@mui/material';

import { HTTPS_SERVER_URL } from '../../constants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const PREFIX = 'SetScheduleModal';

const classes = {
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.modal}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  [`& .${classes.paper}`]: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

interface SetScheduleModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SetScheduleModal({ open, onClose }: SetScheduleModalProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { room } = useVideoContext();
  const name = room?.localParticipant?.identity || 'Participant';

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (file === null) {
      setError('No file selected');
      return;
    }

    setIsLoading(true);

    const body = new FormData();
    body.append('identity', name);
    body.append('start_time', startTime);
    body.append('end_time', endTime);
    body.append('file', file);

    const response = await fetch(`${HTTPS_SERVER_URL}/schedule`, {
      method: 'POST',
      body: body,
    });

    if (response.status === 200) {
      onClose();
      setStartTime('');
      setEndTime('');
      setFile(null);
      setError('');
    } else {
      const result = await response.text();
      setError(`Error: ${response.status} - ${result}`);
    }

    setIsLoading(false);
  };

  // set default time when opening modal
  useEffect(() => {
    if (!open) {
      return;
    }

    const now = new Date();
    // remove minutes part
    now.setMinutes(0, 0, 0);

    // default end time is start time + 2 hours
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    twoHoursLater.setMinutes(0, 0, 0);

    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const formattedStartTime = formatTime(now);
    const formattedEndTime = formatTime(twoHoursLater);

    setStartTime(formattedStartTime);
    setEndTime(formattedEndTime);
  }, [open]);

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      className={classes.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <Typography variant="h6">Set Class Schedule</Typography>
          <Typography variant="caption">Upload your class notes to generate a class schedule using AI</Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '20px' }}>
            <TextField
              variant="standard"
              label="Class Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              style={{ marginBottom: '20px' }}
            />

            <TextField
              variant="standard"
              label="Class End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              style={{ marginBottom: '20px' }}
            />

            <input accept="*/*" style={{ display: 'none' }} id="upload-file" type="file" onChange={handleFileChange} />

            <Grid container style={{ marginBottom: '20px' }} alignItems="center">
              <Grid item>
                <label htmlFor="upload-file">
                  <Button variant="contained" component="span">
                    Upload File
                  </Button>
                </label>
              </Grid>

              <Grid item>
                {file && (
                  <Typography variant="body2" style={{ marginLeft: '10px' }}>
                    {file.name}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {error && (
              <Typography color="error" style={{ marginBottom: '20px' }}>
                {error}
              </Typography>
            )}

            <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
              {isLoading && <CircularProgress size={24} />}
              {isLoading ? 'Generating...' : 'Submit'}
            </Button>
          </form>
        </div>
      </Fade>
    </StyledModal>
  );
}
