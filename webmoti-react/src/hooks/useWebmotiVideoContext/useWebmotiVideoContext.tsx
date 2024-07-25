import { useContext } from 'react';
import WebmotiVideoContext from '../../components/WebmotiVideoProvider';

export default function useWebmotiVideoContext() {
  const context = useContext(WebmotiVideoContext);
  if (!context) {
    throw new Error('useWebmotiVideoContext must be used within a WebmotiVideoProvider');
  }
  return context;
}
