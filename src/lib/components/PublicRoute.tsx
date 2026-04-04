import { Navigate } from 'react-router-dom';
import { hasValidSession, normalizePublicEntry } from '../utils/token';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  normalizePublicEntry();
  if (hasValidSession()) {
    return <Navigate to="/Dashboard" replace />;
  }

  return <>{children}</>;
};
