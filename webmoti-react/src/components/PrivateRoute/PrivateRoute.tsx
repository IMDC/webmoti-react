import { Navigate, useLocation } from 'react-router-dom';
import { useAppState } from '../../state';
import { SET_AUTH } from '../../clientEnv';

interface Props {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: Props) {
  const { isAuthReady, user } = useAppState();
  const location = useLocation();

  const renderChildren = user || !SET_AUTH;

  if (!renderChildren && !isAuthReady) {
    return null;
  }

  return renderChildren ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
