import { IconButton } from '@material-ui/core';
import { EmojiPeople, PanTool } from '@material-ui/icons';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function WaveHandButton() {
  const { sendHandRequest } = useWebmotiVideoContext();

  const wave = async () => {
    await sendHandRequest('WAVE');
  };

  const wave2 = async () => {
    await sendHandRequest('WAVE2');
  };

  return (
    <div>
      <IconButton onClick={wave2}>
        <PanTool />
      </IconButton>

      <IconButton onClick={wave}>
        <EmojiPeople />
      </IconButton>
    </div>
  );
}
