let KcAdminClient;

class KeycloakAdminService {
  constructor() {
    this.kcAdminClient = null;
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      const { default: KcAdminClientImport } = await import('@keycloak/keycloak-admin-client');
      KcAdminClient = KcAdminClientImport;
      this.kcAdminClient = new KcAdminClient({
        baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
        realmName: process.env.KEYCLOAK_REALM || 'master',
      });
      this.initialized = true;
    }
  }

  async authenticate() {
    try {
      await this.init();
      // Check if client credentials are available
      if (process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET) {
        await this.kcAdminClient.auth({
          grantType: 'client_credentials',
          clientId: process.env.KEYCLOAK_CLIENT_ID,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        });
        console.log('Keycloak admin client authenticated with client credentials');
      } else {
        // Fallback to username/password authentication
        await this.kcAdminClient.auth({
          username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
          password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
          grantType: 'password',
          clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
        });
        console.log('Keycloak admin client authenticated with username/password');
      }
    } catch (error) {
      console.error('Failed to authenticate Keycloak admin client:', error.message);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      await this.authenticate();
      
      const userPayload = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled !== undefined ? userData.enabled : true,
        emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
      };

      if (userData.password) {
        userPayload.credentials = [{
          type: 'password',
          value: userData.password,
          temporary: userData.temporaryPassword !== undefined ? userData.temporaryPassword : true,
        }];
      }

      const createdUser = await this.kcAdminClient.users.create(userPayload);
      console.log('User created successfully:', createdUser);
      return createdUser;
    } catch (error) {
      console.error('Failed to create user:', error.message);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      await this.authenticate();
      const user = await this.kcAdminClient.users.findOne({ id: userId });
      return user;
    } catch (error) {
      console.error('Failed to get user:', error.message);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      await this.authenticate();
      const users = await this.kcAdminClient.users.find({ username });
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Failed to get user by username:', error.message);
      throw error;
    }
  }

  async getAllClients() {
    try {
      await this.authenticate();
      const clients = await this.kcAdminClient.clients.find();
      return clients;
    } catch (error) {
      console.error('Failed to get clients:', error.message);
      throw error;
    }
  }

  async getClientById(clientId) {
    try {
      await this.authenticate();
      const client = await this.kcAdminClient.clients.findOne({ id: clientId });
      return client;
    } catch (error) {
      console.error('Failed to get client by ID:', error.message);
      throw error;
    }
  }

  async getAllRoles() {
    try {
      await this.authenticate();
      const roles = await this.kcAdminClient.roles.find();
      return roles;
    } catch (error) {
      console.error('Failed to get roles:', error.message);
      throw error;
    }
  }

  async getRoleById(roleId) {
    try {
      await this.authenticate();
      const role = await this.kcAdminClient.roles.findOneById({ id: roleId });
      return role;
    } catch (error) {
      console.error('Failed to get role by ID:', error.message);
      throw error;
    }
  }

  async getRoleByName(roleName) {
    try {
      await this.authenticate();
      const role = await this.kcAdminClient.roles.findOneByName({ name: roleName });
      return role;
    } catch (error) {
      console.error('Failed to get role by name:', error.message);
      throw error;
    }
  }

  async getUsersInRole(roleName) {
    try {
      await this.authenticate();
      const users = await this.kcAdminClient.roles.findUsersWithRole({ name: roleName });
      return users;
    } catch (error) {
      console.error('Failed to get users in role:', error.message);
      throw error;
    }
  }

  async getUserRoles(userId) {
    try {
      await this.authenticate();
      const roles = await this.kcAdminClient.users.listRealmRoleMappings({ id: userId });
      return roles;
    } catch (error) {
      console.error('Failed to get user roles:', error.message);
      throw error;
    }
  }
}

module.exports = new KeycloakAdminService();