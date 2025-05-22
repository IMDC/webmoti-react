import { PropsWithChildren } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider } from '@mui/material';
import Video from 'twilio-video';

import packageJSON from '../../../package.json';
import { useAppState } from '../../state';
import { clientEnv } from '../../clientEnv';

interface AboutDialogProps {
  open: boolean;
  onClose(): void;
}

function AboutDialog({ open, onClose }: PropsWithChildren<AboutDialogProps>) {
  const { roomType } = useAppState();
  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="xs" aria-labelledby="about-dialog-title">
      <DialogTitle id="about-dialog-title">About</DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText>Browser supported: {String(Video.isSupported)}</DialogContentText>
        <DialogContentText>SDK Version: {Video.version}</DialogContentText>
        <DialogContentText>App Version: {packageJSON.version}</DialogContentText>
        <DialogContentText>Deployed Tag: {clientEnv.GIT_TAG() || 'N/A'}</DialogContentText>
        <DialogContentText>Deployed Commit Hash: {clientEnv.GIT_COMMIT() || 'N/A'}</DialogContentText>
        {roomType && <DialogContentText>Room Type: {roomType}</DialogContentText>}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AboutDialog;
