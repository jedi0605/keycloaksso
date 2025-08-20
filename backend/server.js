require('dotenv').config();
const express = require('express');
const cors = require('cors');
const verifyKeycloakToken = require('./middleware/keycloakAuth');
const keycloakAdmin = require('./config/keycloakAdmin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/random', verifyKeycloakToken, (req, res) => {
  const randomNumber = Math.floor(Math.random() * 1000) + 1;
  res.json({ 
    number: randomNumber,
    timestamp: new Date().toISOString(),
    user: {
      sub: req.user.sub,
      preferred_username: req.user.preferred_username,
      email: req.user.email
    }
  });
});

app.post('/api/users', verifyKeycloakToken, async (req, res) => {
  try {
    const { username, email, firstName, lastName, password, enabled, emailVerified, temporaryPassword } = req.body;

    if (!username || !email) {
      return res.status(400).json({ 
        error: 'Username and email are required' 
      });
    }

    const existingUser = await keycloakAdmin.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this username already exists' 
      });
    }

    const userData = {
      username,
      email,
      firstName,
      lastName,
      password,
      enabled,
      emailVerified,
      temporaryPassword
    };

    const createdUser = await keycloakAdmin.createUser(userData);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: createdUser.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      message: error.message 
    });
  }
});

app.get('/api/users/:userId', verifyKeycloakToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await keycloakAdmin.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: user.enabled,
      emailVerified: user.emailVerified,
      createdTimestamp: user.createdTimestamp
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      message: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});