import React from 'react';
import { useAuth } from '../AuthContext';
import LoginButton from './LoginButton';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You need to login to access this content.</p>
        <LoginButton />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;