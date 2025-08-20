const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'myrealm';
const CLIENT_ID = 'myclient';

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
  cache: false, // Disable cache to avoid stale key issues
  rateLimit: false, // Disable rate limiting for debugging
  requestHeaders: {}, // Ensure no extra headers
  timeout: 30000 // 30 second timeout
});

function getKey(header, callback) {
  console.log('Looking for key with kid:', header.kid);
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('JWKS key lookup failed:', err.message);
      console.error('Header kid:', header.kid);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    console.log('Found signing key');
    callback(null, signingKey);
  });
}

const verifyKeycloakToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No token provided',
      message: 'Authorization header with Bearer token is required'
    });
  }

  const token = authHeader.substring(7);
  console.log('Received token for verification:', token);
  
  // Decode token header to see what key ID is expected
  try {
    const tokenHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Token header:', tokenHeader);
    console.log('Token payload issuer:', tokenPayload.iss);
    console.log('Token payload audience:', tokenPayload.aud);
  } catch (e) {
    console.log('Could not decode token for debugging:', e.message);
  }

  jwt.verify(token, getKey, {
    audience: ['account', CLIENT_ID], // Accept both 'account' and the client ID
    issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      console.error('Full error:', err);
      return res.status(401).json({ 
        error: 'Invalid token',
        message: err.message
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyKeycloakToken;