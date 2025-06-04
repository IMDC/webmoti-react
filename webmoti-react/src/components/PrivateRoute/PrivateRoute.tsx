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

  const isAuthDisabled = !clientEnv.SET_AUTH();
  const renderChildren = user || isAuthDisabled;

  if (!renderChildren && !isAuthReady) {
    return null;
  }

  return renderChildren ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
