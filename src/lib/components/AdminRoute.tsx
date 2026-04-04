import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/token';

const adminRoles = new Set(['dev', 'admin']);

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getUserFromToken();
  const role = typeof user?.role === 'string' ? user.role : '';

  if (!user || !adminRoles.has(role)) {
    return <Navigate to="/Dashboard" replace />;
  }

  return <>{children}</>;
};
