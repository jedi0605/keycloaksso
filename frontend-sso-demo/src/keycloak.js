import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://sso.qa.caipa.com',
  realm: 'caipa',
  clientId: 'DirectoryTool'
});


// const keycloak = new Keycloak({
//   url: 'http://localhost:8080',
//   realm: 'myrealm',
//   clientId: 'myclient'
// });

export default keycloak;