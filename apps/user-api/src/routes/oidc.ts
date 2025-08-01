import { Router, Request, Response } from 'express';
import { OIDCProvider } from '@naidp/protocols';
import { SqlClientRepository, SqlUserRepository } from '@naidp/db';
import { ClientType } from '@naidp/domain';

const router = Router();
const clientRepository = new SqlClientRepository();
const userRepository = new SqlUserRepository();

// Initialize OIDC provider
const oidcProvider = new OIDCProvider({
  issuer: process.env.OIDC_ISSUER || 'https://naidp.example.com',
  async findAccount(ctx, id) {
    const user = await userRepository.findById(id);
    return user ? oidcProvider.createAccount(user) : undefined;
  }
});

// Mount the OIDC provider
router.use('/', oidcProvider.getProvider().callback());

// OIDC Discovery endpoint (.well-known/openid_configuration)
router.get('/.well-known/openid_configuration', async (req: Request, res: Response) => {
  try {
    const issuer = process.env.OIDC_ISSUER || 'https://naidp.example.com';
    
    const configuration = {
      issuer,
      authorization_endpoint: `${issuer}/auth/oidc/auth`,
      token_endpoint: `${issuer}/auth/oidc/token`,
      userinfo_endpoint: `${issuer}/auth/oidc/userinfo`,
      jwks_uri: `${issuer}/auth/oidc/jwks`,
      end_session_endpoint: `${issuer}/auth/oidc/logout`,
      scopes_supported: ['openid', 'email', 'profile', 'offline_access'],
      response_types_supported: [
        'code',
        'code id_token',
        'code token',
        'code id_token token',
        'id_token',
        'id_token token'
      ],
      response_modes_supported: ['query', 'fragment', 'form_post'],
      grant_types_supported: [
        'authorization_code',
        'refresh_token',
        'client_credentials'
      ],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: [
        'client_secret_basic',
        'client_secret_post',
        'client_secret_jwt',
        'private_key_jwt',
        'none'
      ],
      claims_supported: [
        'sub',
        'email',
        'email_verified',
        'name',
        'given_name',
        'family_name',
        'updated_at'
      ]
    };

    res.json(configuration);
  } catch (error) {
    console.error('OIDC discovery error:', error);
    res.status(500).json({
      error: 'OIDC_ERROR',
      message: 'Failed to provide OIDC configuration'
    });
  }
});

// OIDC Authorization endpoint
router.get('/auth', async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      redirect_uri,
      response_type = 'code',
      scope = 'openid email profile',
      state,
      nonce
    } = req.query;

    if (!client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'client_id and redirect_uri are required'
      });
    }

    const client = await clientRepository.findByClientId(client_id as string);
    
    if (!client || client.type !== ClientType.OIDC) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client_id'
      });
    }

    if (!client.isActive) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Client is inactive'
      });
    }

    if (!client.isRedirectUriAllowed(redirect_uri as string)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid redirect_uri'
      });
    }

    // Add client to OIDC provider if not already added
    await oidcProvider.addClient(client);

    // Create authorization URL
    const authUrl = oidcProvider.getAuthorizationUrl({
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      scope: scope as string,
      response_type: response_type as string,
      state: state as string
    });

    // In a real implementation, you would handle the interaction flow
    // For this example, we'll return the authorization URL
    res.json({
      message: 'OIDC authorization request received',
      authorizationUrl: authUrl,
      loginUrl: `/auth/oidc/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri as string)}&state=${state}&nonce=${nonce}`
    });
  } catch (error) {
    console.error('OIDC authorization error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Authorization request failed'
    });
  }
});

// OIDC Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, client_id, redirect_uri, state, nonce } = req.body;

    if (!email || !password || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'email, password, client_id, and redirect_uri are required'
      });
    }

    // Authenticate user
    const user = await userRepository.findByEmail(email);
    if (!user || !await user.verifyPassword(password)) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      });
    }

    const client = await clientRepository.findByClientId(client_id);
    if (!client || client.type !== ClientType.OIDC) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client_id'
      });
    }

    // In a real implementation, you would:
    // 1. Create an authorization code
    // 2. Store the user session
    // 3. Redirect to the client with the code

    // For this example, we'll return a mock authorization code
    const authCode = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set('code', authCode);
    if (state) callbackUrl.searchParams.set('state', state);

    res.json({
      message: 'Authentication successful',
      authorizationCode: authCode,
      callbackUrl: callbackUrl.toString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName
      }
    });
  } catch (error) {
    console.error('OIDC login error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Login failed'
    });
  }
});

// OIDC Token endpoint
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code grant type is supported'
      });
    }

    if (!code || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'code, client_id, and redirect_uri are required'
      });
    }

    const client = await clientRepository.findByClientId(client_id);
    
    if (!client || client.type !== ClientType.OIDC) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client_id'
      });
    }

    if (client.clientSecret && client.clientSecret !== client_secret) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client_secret'
      });
    }

    // In a real implementation, you would:
    // 1. Validate the authorization code
    // 2. Get the user associated with the code
    // 3. Generate access and ID tokens

    // For this example, we'll return mock tokens
    const mockUser = await userRepository.findByEmail('test@example.com'); // Mock user
    
    if (!mockUser) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid authorization code'
      });
    }

    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const idToken = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
      refresh_token: refreshToken,
      scope: 'openid email profile'
    });
  } catch (error) {
    console.error('OIDC token error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Token request failed'
    });
  }
});

// OIDC UserInfo endpoint
router.get('/userinfo', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Missing or invalid access token'
      });
    }

    const accessToken = authHeader.substring(7);
    
    // In a real implementation, you would validate the access token
    // and get the user information associated with it
    
    // For this example, we'll return mock user info
    res.json({
      sub: 'user123',
      email: 'test@example.com',
      email_verified: true,
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      updated_at: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    console.error('OIDC userinfo error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'UserInfo request failed'
    });
  }
});

export { router as oidcRouter };