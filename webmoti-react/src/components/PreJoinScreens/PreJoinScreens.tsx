import { FormEvent, useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import MediaErrorSnackbar from './MediaErrorSnackbar/MediaErrorSnackbar';
import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import IntroContainer from '../IntroContainer/IntroContainer';
import { clientEnv } from '../../clientEnv';

export enum Steps {
  roomNameStep,
  deviceSelectionStep,
}

export default function PreJoinScreens() {
  const { user } = useAppState();
  const { getAudioAndVideoTracks } = useVideoContext();

  const { URLRoomName } = useParams<{ URLRoomName?: string }>();

  // don't show room name step with firebase auth since identity is already set based on google account
  const initialStep = clientEnv.SET_AUTH() === 'firebase' ? Steps.deviceSelectionStep : Steps.roomNameStep;
  const [step, setStep] = useState(initialStep);

  const [name, setName] = useState<string>(user?.displayName || '');
  // default room is "Classroom"
  const [roomName, setRoomName] = useState<string>('Classroom');

  const [mediaError, setMediaError] = useState<Error>();

  useEffect(() => {
    if (URLRoomName) {
      setRoomName(URLRoomName);
      if (user?.displayName) {
        setStep(Steps.deviceSelectionStep);
      }
    }
  }, [user, URLRoomName]);

  useEffect(() => {
    if (step === Steps.deviceSelectionStep && !mediaError) {
      getAudioAndVideoTracks().catch((error) => {
        console.log('Error acquiring local media:');
        console.dir(error);
        setMediaError(error);
      });
    }
  }, [getAudioAndVideoTracks, step, mediaError]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // If this app is deployed as a twilio function, don't change the URL because routing isn't supported.
    if (!window.location.origin.includes('twil.io')) {
      window.history.replaceState(null, '', window.encodeURI(`/room/${roomName}${window.location.search || ''}`));
    }
    setStep(Steps.deviceSelectionStep);
  };

  return (
    <IntroContainer>
      <MediaErrorSnackbar error={mediaError} />
      {step === Steps.roomNameStep && (
        <RoomNameScreen
          name={name}
          roomName={roomName}
          setName={setName}
          setRoomName={setRoomName}
          handleSubmit={handleSubmit}
        />
      )}

      {step === Steps.deviceSelectionStep && (
        <DeviceSelectionScreen name={name} roomName={roomName} setStep={setStep} />
      )}
    </IntroContainer>
  );
}
