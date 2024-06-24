import Button from '@material-ui/core/Button';
import { useHotkeys } from 'react-hotkeys-hook';

import { WEBMOTI_CAMERA_1 } from '../../../constants';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';
import ShortcutTooltip from '../../ShortcutTooltip/ShortcutTooltip';

export default function ToggleCameraButton() {
  const { room, muteParticipant } = useVideoContext();
  const { isMuted, toggleClassroomMute } = useWebmotiVideoContext();

  useHotkeys('ctrl+l', (event) => {
    event.preventDefault();
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
      <Button onClick={() => toggleMute()}>{isMuted ? 'Unmute Classroom' : 'Mute Classroom'}</Button>
    </ShortcutTooltip>
  );
}
