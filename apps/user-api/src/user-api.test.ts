import request from 'supertest';
import { createApp } from '../src/index';

describe('User API', () => {
  let app: any;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('firstName', testUser.firstName);
      expect(response.body.user).toHaveProperty('lastName', testUser.lastName);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should not allow duplicate email registration', async () => {
      await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expires_in');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should verify valid token', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post('/auth/verify')
        .send({ token })
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .post('/auth/verify')
        .send({ token: 'invalid-token' })
        .expect(401);
    });
  });

  describe('SAML Endpoints', () => {
    it('should return SAML metadata', async () => {
      const response = await request(app)
        .get('/auth/saml/metadata')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/xml');
    });

    it('should handle SAML SSO request without client_id', async () => {
      await request(app)
        .get('/auth/saml/sso')
        .expect(400);
    });
  });

  describe('OIDC Endpoints', () => {
    it('should return OIDC discovery configuration', async () => {
      const response = await request(app)
        .get('/auth/oidc/.well-known/openid_configuration')
        .expect(200);

      expect(response.body).toHaveProperty('issuer');
      expect(response.body).toHaveProperty('authorization_endpoint');
      expect(response.body).toHaveProperty('token_endpoint');
      expect(response.body).toHaveProperty('userinfo_endpoint');
      expect(response.body).toHaveProperty('jwks_uri');
    });

    it('should handle OIDC authorization request without required parameters', async () => {
      await request(app)
        .get('/auth/oidc/auth')
        .expect(400);
    });
  });

  describe('OAuth2 Endpoints', () => {
    it('should handle OAuth2 authorization request without required parameters', async () => {
      await request(app)
        .get('/oauth/authorize')
        .expect(400);
    });

    it('should handle OAuth2 token request with invalid grant type', async () => {
      await request(app)
        .post('/oauth/token')
        .send({ grant_type: 'invalid_grant' })
        .expect(400);
    });
  });
});