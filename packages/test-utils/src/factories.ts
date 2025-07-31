import { User, Client, ClientType } from '@naidp/domain';

export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return new User({
      email: 'test@example.com',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
      ...overrides
    });
  }

  static createClient(overrides: Partial<Client> = {}): Client {
    return new Client({
      name: 'Test Client',
      type: ClientType.OIDC,
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUris: ['http://localhost:3000/callback'],
      allowedScopes: ['openid', 'email', 'profile'],
      isActive: true,
      ...overrides
    });
  }

  static createSAMLClient(overrides: Partial<Client> = {}): Client {
    return new Client({
      name: 'Test SAML Client',
      type: ClientType.SAML,
      clientId: 'test-saml-client',
      redirectUris: ['http://localhost:3000/saml/acs'],
      allowedScopes: ['saml'],
      metadata: {
        entityID: 'test-saml-client',
        singleLogoutService: 'http://localhost:3000/saml/sls'
      },
      isActive: true,
      ...overrides
    });
  }

  static createOAuth2Client(overrides: Partial<Client> = {}): Client {
    return new Client({
      name: 'Test OAuth2 Client',
      type: ClientType.OAUTH2,
      clientId: 'test-oauth2-client',
      clientSecret: 'test-oauth2-secret',
      redirectUris: ['http://localhost:3000/oauth/callback'],
      allowedScopes: ['read', 'write'],
      isActive: true,
      ...overrides
    });
  }
}