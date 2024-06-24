import { IconButton } from '@material-ui/core';
import { EmojiPeople, PanTool } from '@material-ui/icons';
import { useHotkeys } from 'react-hotkeys-hook';

import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function WaveHandButton() {
  const { sendHandRequest } = useWebmotiVideoContext();

  const wave = async () => {
    await sendHandRequest('WAVE');
  };

  const wave2 = async () => {
    await sendHandRequest('WAVE2');
  };

  useHotkeys('ctrl+3', (event) => {
    event.preventDefault();
    wave2();
  });

  useHotkeys('ctrl+4', (event) => {
    event.preventDefault();
    wave();
  });

  return (
    <div>
      <ShortcutTooltip shortcut="3" isCtrlDown>
        <IconButton onClick={wave2}>
          <PanTool />
        </IconButton>
      </ShortcutTooltip>

      <ShortcutTooltip shortcut="4" isCtrlDown>
        <IconButton onClick={wave}>
          <EmojiPeople />
        </IconButton>
      </ShortcutTooltip>
    </div>
  );
}
