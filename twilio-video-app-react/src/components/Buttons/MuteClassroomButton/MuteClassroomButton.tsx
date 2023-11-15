import Button from '@material-ui/core/Button';

import { WEBMOTI_CAMERA_1 } from '../../../constants';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useWebmotiVideoContext from '../../../hooks/useWebmotiVideoContext/useWebmotiVideoContext';

export default function ToggleCameraButton() {
  const { room, muteParticipant } = useVideoContext();
  const { isMuted, toggleClassroomMute } = useWebmotiVideoContext();

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

  return <Button onClick={() => toggleMute()}>{isMuted ? 'Unmute Classroom' : 'Mute Classroom'}</Button>;
}
