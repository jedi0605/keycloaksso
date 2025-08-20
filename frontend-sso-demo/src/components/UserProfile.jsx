import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const UserProfile = () => {
  const { user, keycloak } = useAuth();
  const [randomData, setRandomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomNumber = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure token is fresh
      await keycloak.updateToken(30);
      
      console.log('Using access token:', keycloak.token);
      console.log('Token parsed:', keycloak.tokenParsed);
      
      const response = await fetch('http://localhost:3001/api/random', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRandomData(data);
      } else {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        setError(`Failed to fetch random number: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Full error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  console.log('User object:', user);
  console.log('Keycloak realmAccess:', keycloak?.realmAccess);
  console.log('Full token:', keycloak?.tokenParsed);
  console.log('Raw keycloak object:', keycloak);
  
  return (
    <div className="user-profile">
      <h3>User Profile</h3>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>First Name:</strong> {user.firstName}</p>
      <p><strong>Last Name:</strong> {user.lastName}</p>
      
      <div className="attributes-section">
        <h4>User Attributes</h4>
        {user.attributes && Object.keys(user.attributes).length > 0 ? (
          <div className="attributes-list">
            {Object.entries(user.attributes).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
              </p>
            ))}
          </div>
        ) : (
          <p>No custom attributes configured</p>
        )}
      </div>
      
      <div className="roles-section">
        <h4>Roles</h4>
        
        <div className="realm-roles">
          <h5>Realm Roles:</h5>
          {user.realmRoles && user.realmRoles.length > 0 ? (
            <ul>
              {user.realmRoles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
            </ul>
          ) : (
            <p>No realm roles assigned</p>
          )}
        </div>
        
        <div className="client-roles">
          <h5>Client Roles:</h5>
          {user.clientRoles && Object.keys(user.clientRoles).length > 0 ? (
            Object.entries(user.clientRoles).map(([client, roleData]) => (
              <div key={client} className="client-role-group">
                <strong>{client}:</strong>
                <ul>
                  {roleData.roles.map((role, index) => (
                    <li key={index}>{role}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No client roles assigned</p>
          )}
        </div>
      </div>

      <div className="random-section">
        <h4>Random Number Generator</h4>
        <button 
          onClick={fetchRandomNumber} 
          disabled={loading}
          className="random-btn"
        >
          {loading ? 'Loading...' : 'Get Random Number'}
        </button>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
        
        {randomData && (
          <div className="random-data" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p><strong>Random Number:</strong> {randomData.number}</p>
            <p><strong>Generated At:</strong> {new Date(randomData.timestamp).toLocaleString()}</p>
            <p><strong>Generated For:</strong> {randomData.user.preferred_username || randomData.user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;