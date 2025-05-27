import { ReactNode, createContext, useCallback, useState } from 'react';
import * as React from 'react';

import { Events, HTTPS_SERVER_URL, WEBMOTI_CAMERA_1 } from '../../constants';
import soundsFile from '../../sounds/ClearAnnounceTones.wav';
import excuse_me_1 from '../../sounds/speech/excuse_me_professor_1.mp3';
import excuse_me_2 from '../../sounds/speech/excuse_me_professor_2.mp3';
import question_1 from '../../sounds/speech/i_have_a_question_1.mp3';
import question_2 from '../../sounds/speech/i_have_a_question_2.mp3';
import neutral_excuse_me from '../../sounds/speech/neutral_excuse_me.mp3';
import neutral_professor from '../../sounds/speech/neutral_professor.mp3';
import neutral_question from '../../sounds/speech/neutral_question.mp3';
import professor_1 from '../../sounds/speech/professor_1.mp3';
import professor_2 from '../../sounds/speech/professor_2.mp3';
import professor_3 from '../../sounds/speech/professor_3.mp3';
import { useAppState } from '../../state';

interface SoundEntry {
  sound: string;
  name: string;
}

interface SoundsMap {
  [key: string]: SoundEntry;
}

export const Sounds: SoundsMap = {
  Bell: { sound: soundsFile, name: 'Bell' },
  Formal1: { sound: excuse_me_1, name: 'Formal Male' },
  Formal2: { sound: excuse_me_2, name: 'Formal Female' },
  Direct1: { sound: question_1, name: 'Direct Male' },
  Direct2: { sound: question_2, name: 'Direct Female' },
  Inquisitive1: { sound: professor_1, name: 'Inquisitive Male' },
  Inquisitive2: { sound: professor_2, name: 'Inquisitive Female' },
  Inquisitive3: { sound: professor_3, name: 'Inquisitive Female 2' },
  NeutralFormal: { sound: neutral_excuse_me, name: 'Formal Neutral' },
  NeutralDirect: { sound: neutral_question, name: 'Direct Neutral' },
  NeutralInquisitive: { sound: neutral_professor, name: 'Inquisitive Neutral' },
};

interface WebmotiVideoContextType {
  isCameraOneOff: boolean;
  isCameraTwoOff: boolean;
  toggleWebmotiVideo: (camera: string) => void;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  zoom: number;
  setZoomLevel: (level: number) => void;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isMuted: boolean;
  toggleClassroomMute: () => void;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  sendHandRequest: (mode: string, identity?: string | null, is_silent?: boolean) => Promise<Response>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  soundKey: string;
  setSoundKey: React.Dispatch<React.SetStateAction<string>>;
  playSetSound: (soundStr?: string) => void;
}

const WebmotiVideoContext = createContext<WebmotiVideoContextType | undefined>(undefined);

interface WebmotiVideoProviderProps {
  children: ReactNode;
}

export const WebmotiVideoProvider = ({ children }: WebmotiVideoProviderProps) => {
  const [isCameraOneOff, setIsCameraOneOff] = useState(false);
  const [isCameraTwoOff, setIsCameraTwoOff] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [volume, setVolume] = useState(50);
  const [soundKey, setSoundKey] = useState(Object.keys(Sounds)[1]);

  const playSetSound = useCallback(
    (soundStr?: string) => {
      const key = soundStr ? soundStr : soundKey;
      const sound = Sounds[key];
      const audio = new Audio(sound.sound);
      // volume is 0 to 1 but slider is 1 to 100
      audio.volume = volume / 100;
      audio.play();
    },
    [soundKey, volume]
  );

  const { setError } = useAppState();

  const toggleWebmotiVideo = (camera: string) => {
    if (camera === WEBMOTI_CAMERA_1) {
      setIsCameraOneOff((prev) => !prev);
    } else {
      setIsCameraTwoOff((prev) => !prev);
    }
  };

  const setZoomLevel = (level: number) => {
    if (level >= 1 && level <= 3) {
      setZoom(level);

      // keep pan offset accurate
      if (level === 1) {
        setPan({ x: 0, y: 0 });
      } else {
        const event = new CustomEvent(Events.ZoomChanged, { detail: { zoomLevel: level } });
        window.dispatchEvent(event);
      }
    }
  };

  const toggleClassroomMute = () => {
    setIsMuted(!isMuted);
  };

  const sendHandRequest = useCallback(
    async (mode: string, identity: string | null = null, is_silent = false) => {
      try {
        const response = await fetch(`${HTTPS_SERVER_URL}/raisehand`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, identity }),
        });

        if (!response.ok && !is_silent) {
          if (response.status === 503) {
            setError(new Error('WebMoti is offline'));
          } else {
            const text = await response.text();
            setError(new Error(`HTTP ${response.status}: ${text}`));
          }
        }

        return response;
      } catch (err) {
        console.error('Network error:', err);
        if (!is_silent) {
          setError(new Error('Network error'));
        }
        return new Response(null, { status: 0 });
      }
    },
    [setError]
  );

  return (
    <WebmotiVideoContext.Provider
      value={{
        isCameraOneOff,
        isCameraTwoOff,
        toggleWebmotiVideo,
        rotation,
        setRotation,
        zoom,
        setZoomLevel,
        pan,
        setPan,
        isMuted,
        toggleClassroomMute,
        isAdmin,
        setIsAdmin,
        sendHandRequest,
        volume,
        setVolume,
        soundKey,
        setSoundKey,
        playSetSound,
      }}
    >
      {children}
    </WebmotiVideoContext.Provider>
  );
};

export default WebmotiVideoContext;
