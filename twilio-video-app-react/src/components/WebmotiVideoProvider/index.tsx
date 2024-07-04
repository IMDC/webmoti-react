import React, { ReactNode, createContext, useCallback, useState } from 'react';

import { Conversation, JSONObject, Message } from '@twilio/conversations';

import { SERVER_URL, WEBMOTI_CAMERA_1, WEBMOTI_CAMERA_2 } from '../../constants';
import { useAppState } from '../../state';

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
  isWebmotiVideo: (identity: string) => boolean;
  isMuted: boolean;
  toggleClassroomMute: () => void;
  isProfessor: boolean;
  setIsProfessor: React.Dispatch<React.SetStateAction<boolean>>;
  isAdmin: boolean;
  setAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  adminName: string;
  setAdminName: React.Dispatch<React.SetStateAction<string>>;
  professorsName: string;
  setProfessorsName: React.Dispatch<React.SetStateAction<string>>;
  sendSystemMsg: (conversation: Conversation | null, msg: string) => void;
  sendHandRequest: (mode: string, identity?: string | null, is_silent?: boolean) => Promise<Response>;
  checkSystemMsg: (message: Message) => boolean;
}

const WebmotiVideoContext = createContext<WebmotiVideoContextType | undefined>(undefined);

interface WebmotiVideoProviderProps {
  children: ReactNode;
}

export const WebmotiVideoProvider: React.FC<WebmotiVideoProviderProps> = ({ children }) => {
  const [isCameraOneOff, setIsCameraOneOff] = useState(false);
  const [isCameraTwoOff, setIsCameraTwoOff] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [professorsName, setProfessorsName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');

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
        const event = new CustomEvent('webmotizoomchanged', { detail: { zoomLevel: level } });
        window.dispatchEvent(event);
      }
    }
  };

  const isWebmotiVideo = (identity: string) => {
    return identity === WEBMOTI_CAMERA_1 || identity === WEBMOTI_CAMERA_2;
  };

  const toggleClassroomMute = () => {
    setIsMuted(!isMuted);
  };

  const sendSystemMsg = (conversation: Conversation | null, msg: string) => {
    // send with an attribute to differentiate from normal msg
    conversation?.sendMessage(msg, { attributes: JSON.stringify({ systemMsg: true }) });
  };

  const sendHandRequest = useCallback(
    async (mode: string, identity: string | null = null, is_silent = false) => {
      const response = await fetch(`${SERVER_URL}/raisehand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: mode,
          identity: identity,
        }),
      });

      if (!response.ok && !is_silent) {
        if (response.status === 503) {
          // board not connected to wifi
          setError(Error('WebMoti is offline'));
        } else {
          try {
            const errorBody = await response.json();
            const errorMessage = JSON.stringify(errorBody);
            setError(Error(`${response.status} error: ${errorMessage}`));
          } catch (error) {
            setError(Error(`${response.status} error: Failed to parse error message`));
          }
        }
      }

      return response;
    },
    [setError]
  );

  const checkSystemMsg = useCallback((message: Message) => {
    // parse attributes of msg
    const attrObj = message.attributes as JSONObject;
    if (attrObj.attributes === undefined) {
      // no attributes (not system msg)
      return false;
    }

    const attrSysMsg = JSON.parse(attrObj.attributes as string).systemMsg;
    if (attrSysMsg !== undefined) {
      // not system msg
      return true;
    }

    return false;
  }, []);

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
        isWebmotiVideo,
        isMuted,
        toggleClassroomMute,
        isProfessor,
        setIsProfessor,
        isAdmin,
        setAdmin: setIsAdmin,
        adminName,
        setAdminName,
        professorsName,
        setProfessorsName,
        sendSystemMsg,
        sendHandRequest,
        checkSystemMsg,
      }}
    >
      {children}
    </WebmotiVideoContext.Provider>
  );
};

export default WebmotiVideoContext;
