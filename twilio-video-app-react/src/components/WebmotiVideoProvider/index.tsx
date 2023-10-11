import React, { ReactNode, createContext, useState } from 'react';

interface WebmotiVideoContextType {
  isWebmotiVideoHidden: boolean;
  toggleWebmotiVideo: () => void;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
}

const WebmotiVideoContext = createContext<WebmotiVideoContextType | undefined>(undefined);

interface WebmotiVideoProviderProps {
  children: ReactNode;
}

export const WebmotiVideoProvider: React.FC<WebmotiVideoProviderProps> = ({ children }) => {
  const [isWebmotiVideoHidden, setIsWebmotiVideoHidden] = useState(false);
  const [rotation, setRotation] = useState(0);

  const toggleWebmotiVideo = () => {
    setIsWebmotiVideoHidden(prev => !prev);
  };

  return (
    <WebmotiVideoContext.Provider value={{ isWebmotiVideoHidden, toggleWebmotiVideo, rotation, setRotation }}>
      {children}
    </WebmotiVideoContext.Provider>
  );
};

export default WebmotiVideoContext;
