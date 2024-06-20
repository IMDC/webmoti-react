import { IconButton } from '@material-ui/core';
import { EmojiPeople, PanTool } from '@material-ui/icons';

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

  return (
    <div>
      <ShortcutTooltip shortcut="P" isCtrlDown>
        <IconButton onClick={wave2}>
          <PanTool />
        </IconButton>
      </ShortcutTooltip>

      <ShortcutTooltip shortcut="L" isCtrlDown>
        <IconButton onClick={wave}>
          <EmojiPeople />
        </IconButton>
      </ShortcutTooltip>
    </div>
  );
}
