const KcAdminClient = require('@keycloak/keycloak-admin-client').default;

class KeycloakAdminService {
  constructor() {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
      realmName: process.env.KEYCLOAK_REALM || 'master',
    });
  }

  async authenticate() {
    try {
      await this.kcAdminClient.auth({
        username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
        password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
        grantType: 'password',
        clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
      });
      console.log('Keycloak admin client authenticated successfully');
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
}

module.exports = new KeycloakAdminService();