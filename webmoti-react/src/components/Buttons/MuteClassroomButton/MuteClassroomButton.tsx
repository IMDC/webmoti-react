import Button from '@material-ui/core/Button';

import { WEBMOTI_CAMERA_1 } from '../../../constants';
import useSetupHotkeys from '../../../hooks/useSetupHotkeys/useSetupHotkeys';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleCameraButton() {
  const { room, muteParticipant } = useVideoContext();
  const { isMuted, toggleClassroomMute } = useWebmotiVideoContext();

  useSetupHotkeys('ctrl+l', () => {
    toggleMute();
  });

  const toggleMute = () => {
    // get classroom participant
    let classroom = null;
    if (room && room.participants) {
      for (const participant of room.participants.values()) {
        if (participant.identity === WEBMOTI_CAMERA_1) {
          classroom = participant;
          break;
        }
      }
    }

    if (classroom) {
      muteParticipant(classroom, !isMuted);
      toggleClassroomMute();
    }
  };

  return (
    <ShortcutTooltip shortcut="L" isCtrlDown>
      <Button variant="outlined" onClick={() => toggleMute()}>
        {isMuted ? 'Unmute Classroom' : 'Mute Classroom'}
      </Button>
    </ShortcutTooltip>
  );
}
