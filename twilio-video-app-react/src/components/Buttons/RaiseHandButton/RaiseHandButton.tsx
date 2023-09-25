import Button from '@material-ui/core/Button';
import { Message } from '@twilio/conversations';
import { useEffect, useState } from 'react';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export default function RaiseHandButton() {
  // get participant name for raise hand msg
  const { room } = useVideoContext();
  // default value of "Participant" if undefined
  const name = room?.localParticipant?.identity || 'Participant';

  const { conversation } = useChatContext();

  const [handQueue, setHandQueue] = useState<string[]>([]);

  const raiseHand = () => {
    console.log(handQueue);
    conversation?.sendMessage(`${name} raised hand`);

    const newTab = window.open('https://y24khent.connect.remote.it/raisehand', '_blank');

    if (newTab) {
      window.setTimeout(() => {
        newTab.close();
      }, 12000);
    }
  };

  // event listener for added msg
  useEffect(() => {
    const handleMessageAdded = (message: Message) => {
      if (message.body) {
        // check for raise hand msg format
        const match = message.body.match(/^(.+) raised hand$/);

        if (match) {
          const name = match[1];
          setHandQueue((prevQueue: string[]) => {
            // add if not in queue already
            if (!prevQueue.includes(name)) {
              return [...prevQueue, name];
            }
            return prevQueue;
          });
        }
      }
    };

    conversation?.on('messageAdded', handleMessageAdded);

    return () => {
      conversation?.off('messageAdded', handleMessageAdded);
    };
  }, [conversation]);

  return (
    <Button onClick={raiseHand} variant="contained" color="primary">
      Raise Hand
    </Button>
  );
}
