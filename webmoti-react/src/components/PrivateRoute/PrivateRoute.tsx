import { Navigate, useLocation } from 'react-router-dom';
import { useAppState } from '../../state';
import { clientEnv } from '../../clientEnv';

import type { JSX } from 'react';

interface Props {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: Props) {
  const { isAuthReady, user } = useAppState();
  const location = useLocation();

  const renderChildren = user || clientEnv.SET_AUTH() === 'none';

  if (!renderChildren && !isAuthReady) {
    return null;
  }

  return renderChildren ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
