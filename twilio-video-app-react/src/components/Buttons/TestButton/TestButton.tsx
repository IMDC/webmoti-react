import Button from '@material-ui/core/Button';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export default function TestButton() {
  // get participant name for raise hand msg
  const { room } = useVideoContext();
  // default value of "Participant" if undefined
  const name = room?.localParticipant?.identity || 'Participant';

  const { conversation } = useChatContext();

  const raiseHand = () => {
    conversation?.sendMessage(`${name} raised hand`);

    const newTab = window.open('https://y24khent.connect.remote.it/raisehand', '_blank');

    if (newTab) {
      window.setTimeout(() => {
        newTab.close();
      }, 12000);
    }
  };

  return (
    <Button onClick={raiseHand} variant="contained" color="primary">
      Raise Hand
    </Button>
  );
}
