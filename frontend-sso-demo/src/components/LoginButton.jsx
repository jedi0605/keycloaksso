import React from 'react';
import { useAuth } from '../AuthContext';

const LoginButton = () => {
  const { login } = useAuth();

  return (
    <button onClick={login} className="login-btn">
      Login
    </button>
  );
};

export default LoginButton;