import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Route protection wrapper component.
 * If the user state is null (meaning logged out), it redirects the client to the '/login' path.
 * Otherwise, it allows access by rendering the child components.
 */
export const ProtectedRoute = ({ children }) => {
  const { user } = useApp();

  if (!user) {
    // Redirect to login page and replace history entry to avoid back-button loop
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
