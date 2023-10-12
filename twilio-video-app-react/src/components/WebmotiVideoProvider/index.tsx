import React, { ReactNode, createContext, useState } from 'react';
import { WEBMOTI_CAMERA_1 } from '../../constants';

interface WebmotiVideoContextType {
  isCameraOneOff: boolean;
  isCameraTwoOff: boolean;
  toggleWebmotiVideo: (camera: string) => void;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
}

const WebmotiVideoContext = createContext<WebmotiVideoContextType | undefined>(undefined);

interface WebmotiVideoProviderProps {
  children: ReactNode;
}

export const WebmotiVideoProvider: React.FC<WebmotiVideoProviderProps> = ({ children }) => {
  const [isCameraOneOff, setIsCameraOneOff] = useState(false);
  const [isCameraTwoOff, setIsCameraTwoOff] = useState(false);
  const [rotation, setRotation] = useState(0);

  const toggleWebmotiVideo = (camera: string) => {
    if (camera === WEBMOTI_CAMERA_1) {
      setIsCameraOneOff(prev => !prev);
    } else {
      setIsCameraTwoOff(prev => !prev);
    }
  };

  return (
    <WebmotiVideoContext.Provider value={{ isCameraOneOff, isCameraTwoOff, toggleWebmotiVideo, rotation, setRotation }}>
      {children}
    </WebmotiVideoContext.Provider>
  );
};

export default WebmotiVideoContext;
