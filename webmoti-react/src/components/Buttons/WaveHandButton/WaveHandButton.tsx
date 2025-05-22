import { useState } from 'react';

import { Button, CircularProgress, Grid } from '@mui/material';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function WaveHandButton() {
  const { sendHandRequest } = useWebmotiVideoContext();

  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const wave = async () => {
    setIsLoading1(true);
    await sendHandRequest('WAVE');
    setIsLoading1(false);
  };

  const wave2 = async () => {
    setIsLoading2(true);
    await sendHandRequest('WAVE2');
    setIsLoading2(false);
  };

  useSetupHotkeys('ctrl+3', () => {
    wave();
  });

  useSetupHotkeys('ctrl+4', () => {
    wave2();
  });

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid>
        <ShortcutTooltip shortcut="3" isCtrlDown>
          <span>
            <Button onClick={wave} disabled={isLoading1} variant="contained">
              Wave
              <EmojiPeopleIcon />
              {isLoading1 && <CircularProgress size={24} />}
            </Button>
          </span>
        </ShortcutTooltip>
      </Grid>
      <Grid>
        <ShortcutTooltip shortcut="4" isCtrlDown>
          <span>
            <Button onClick={wave2} disabled={isLoading2} variant="contained">
              Wave Twice
              <EmojiPeopleIcon />
              <EmojiPeopleIcon />
              {isLoading2 && <CircularProgress size={24} />}
            </Button>
          </span>
        </ShortcutTooltip>
      </Grid>
    </Grid>
  );
}
