import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * GuestRoute – wraps public-only routes (login, register).
 * - While session is being checked on mount → show nothing (avoid flicker).
 * - If user IS authenticated → redirect to /dashboard.
 * - If user is NOT authenticated → render the page normally.
 */
const GuestRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  // Wait silently until we know the auth state — the ProtectedRoute
  // spinner handles the visual feedback on the dashboard side.
  if (isInitializing) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default GuestRoute;
