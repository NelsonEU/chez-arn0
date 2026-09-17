import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext.tsx';

export default function RequireAdminAuth() {
  const { authenticated } = useAdminAuth();

  if (authenticated === null) {
    return null; // session check still in flight
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
