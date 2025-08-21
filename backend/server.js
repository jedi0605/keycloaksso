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

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await keycloakAdmin.getAllClients();
    
    const clientsResponse = clients.map(client => ({
      id: client.id,
      clientId: client.clientId,
      name: client.name,
      description: client.description,
      enabled: client.enabled,
      protocol: client.protocol,
      publicClient: client.publicClient,
      bearerOnly: client.bearerOnly,
      standardFlowEnabled: client.standardFlowEnabled,
      implicitFlowEnabled: client.implicitFlowEnabled,
      directAccessGrantsEnabled: client.directAccessGrantsEnabled,
      serviceAccountsEnabled: client.serviceAccountsEnabled,
      frontchannelLogout: client.frontchannelLogout,
      fullScopeAllowed: client.fullScopeAllowed
    }));

    res.json({
      clients: clientsResponse,
      count: clientsResponse.length
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ 
      error: 'Failed to fetch clients',
      message: error.message 
    });
  }
});

app.get('/api/clients/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await keycloakAdmin.getClientById(clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      id: client.id,
      clientId: client.clientId,
      name: client.name,
      description: client.description,
      enabled: client.enabled,
      protocol: client.protocol,
      publicClient: client.publicClient,
      bearerOnly: client.bearerOnly,
      standardFlowEnabled: client.standardFlowEnabled,
      implicitFlowEnabled: client.implicitFlowEnabled,
      directAccessGrantsEnabled: client.directAccessGrantsEnabled,
      serviceAccountsEnabled: client.serviceAccountsEnabled,
      frontchannelLogout: client.frontchannelLogout,
      fullScopeAllowed: client.fullScopeAllowed,
      redirectUris: client.redirectUris,
      webOrigins: client.webOrigins,
      attributes: client.attributes
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ 
      error: 'Failed to fetch client',
      message: error.message 
    });
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await keycloakAdmin.getAllRoles();
    
    const rolesResponse = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      composite: role.composite,
      clientRole: role.clientRole,
      containerId: role.containerId,
      attributes: role.attributes
    }));

    res.json({
      roles: rolesResponse,
      count: rolesResponse.length
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch roles',
      message: error.message 
    });
  }
});

app.get('/api/roles/:roleName', async (req, res) => {
  try {
    const { roleName } = req.params;
    const role = await keycloakAdmin.getRoleByName(roleName);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
      id: role.id,
      name: role.name,
      description: role.description,
      composite: role.composite,
      clientRole: role.clientRole,
      containerId: role.containerId,
      attributes: role.attributes
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ 
      error: 'Failed to fetch role',
      message: error.message 
    });
  }
});

app.get('/api/roles/:roleName/users', async (req, res) => {
  try {
    const { roleName } = req.params;
    const users = await keycloakAdmin.getUsersInRole(roleName);
    console.log('Users in role:', users);
    
    const usersResponse = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: user.enabled,
      emailVerified: user.emailVerified,
      createdTimestamp: user.createdTimestamp
    }));

    res.json({
      roleName: roleName,
      users: usersResponse,
      count: usersResponse.length
    });
  } catch (error) {
    console.error('Error fetching users in role:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users in role',
      message: error.message 
    });
  }
});

app.get('/api/users/:userId/roles', async (req, res) => {
  try {
    const { userId } = req.params;
    const roles = await keycloakAdmin.getUserRoles(userId);
    
    const rolesResponse = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      composite: role.composite,
      clientRole: role.clientRole,
      containerId: role.containerId
    }));

    res.json({
      userId: userId,
      roles: rolesResponse,
      count: rolesResponse.length
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user roles',
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