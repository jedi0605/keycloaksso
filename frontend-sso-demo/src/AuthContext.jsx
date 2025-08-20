import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from './keycloak';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Check if Keycloak is already initialized
        if (keycloak.authenticated !== undefined) {
          setIsAuthenticated(keycloak.authenticated);
          if (keycloak.authenticated) {
            const token = keycloak.tokenParsed;
            setUser({
              username: token?.preferred_username,
              email: token?.email,
              name: token?.name,
              firstName: token?.given_name,
              lastName: token?.family_name,
              attributes: token?.attributes || {},
              realmRoles: keycloak.realmAccess?.roles || [],
              clientRoles: keycloak.resourceAccess || {},
              fullToken: token // For debugging - contains all token fields
            });
          }
          setIsLoading(false);
          return;
        }

        const authenticated = await keycloak.init({
          // onLoad: 'check-sso',
          pkceMethod: 'S256',
          redirectUri: window.location.origin + '/',
          checkLoginIframe: false // Disable iframe check for development
        });
        
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const token = keycloak.tokenParsed;
          setUser({
            username: token?.preferred_username,
            email: token?.email,
            name: token?.name,
            firstName: token?.given_name,
            lastName: token?.family_name,
            attributes: token?.attributes || {},
            realmRoles: keycloak.realmAccess?.roles || [],
            clientRoles: keycloak.resourceAccess || {},
            fullToken: token // For debugging - contains all token fields
          });
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin + '/'
    });
  };

  const logout = () => {
    keycloak.logout();
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    keycloak
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};