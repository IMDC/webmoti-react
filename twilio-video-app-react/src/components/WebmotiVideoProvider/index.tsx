import React, { ReactNode, createContext, useState } from 'react';

interface WebmotiVideoContextType {
  isWebmotiVideoHidden: boolean;
  toggleWebmotiVideo: () => void;
}

const WebmotiVideoContext = createContext<WebmotiVideoContextType | undefined>(undefined);

interface WebmotiVideoProviderProps {
  children: ReactNode;
}

export const WebmotiVideoProvider: React.FC<WebmotiVideoProviderProps> = ({ children }) => {
  const [isWebmotiVideoHidden, setIsWebmotiVideoHidden] = useState(false);

  const toggleWebmotiVideo = () => {
    setIsWebmotiVideoHidden(prev => !prev);
  };

  return (
    <WebmotiVideoContext.Provider value={{ isWebmotiVideoHidden, toggleWebmotiVideo: toggleWebmotiVideo }}>
      {children}
    </WebmotiVideoContext.Provider>
  );
};

export default WebmotiVideoContext;
