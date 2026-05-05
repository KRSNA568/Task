import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // PrivateRoute above already shows the spinner

  const allowed = user?.role === 'admin' || user?.role === 'project_manager';
  return allowed ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
