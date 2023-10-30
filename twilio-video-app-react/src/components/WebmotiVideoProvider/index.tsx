import React, { ReactNode, createContext, useState } from 'react';

import { WEBMOTI_CAMERA_1 } from '../../constants';

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

  const toggleWebmotiVideo = (camera: string) => {
    if (camera === WEBMOTI_CAMERA_1) {
      setIsCameraOneOff(prev => !prev);
    } else {
      setIsCameraTwoOff(prev => !prev);
    }
  };

  const setZoomLevel = (level: number) => {
    if (level >= 1 && level <= 3) {
      setZoom(level);
      // reset pan to center when going to level 1
      if (level === 1) {
        setPan({ x: 0, y: 0 });
      }
    }
  };

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
      }}
    >
      {children}
    </WebmotiVideoContext.Provider>
  );
};

export default WebmotiVideoContext;
