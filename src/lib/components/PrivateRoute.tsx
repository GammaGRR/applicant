import { Navigate } from 'react-router-dom';
import { hasValidSession } from '../utils/token';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  if (!hasValidSession()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
