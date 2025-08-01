import { Router, Request, Response } from 'express';
import { OAuth2Provider, OAuth2Model } from '@naidp/protocols';
import { SqlClientRepository, SqlUserRepository } from '@naidp/db';
import { ClientType } from '@naidp/domain';

const router = Router();
const clientRepository = new SqlClientRepository();
const userRepository = new SqlUserRepository();

// OAuth2 model implementation
const oauth2Model: OAuth2Model = {
  async getAccessToken(accessToken: string) {
    // In a real implementation, you would query the database for the access token
    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
      client: { id: 'test-client' },
      user: { id: 'test-user' }
    };
  },

  async getRefreshToken(refreshToken: string) {
    // In a real implementation, you would query the database for the refresh token
    return {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 86400000), // 24 hours
      client: { id: 'test-client' },
      user: { id: 'test-user' }
    };
  },

  async getAuthorizationCode(authorizationCode: string) {
    // In a real implementation, you would query the database for the authorization code
    return {
      authorizationCode,
      expiresAt: new Date(Date.now() + 600000), // 10 minutes
      redirectUri: 'http://localhost:3000/callback',
      client: { id: 'test-client' },
      user: { id: 'test-user' }
    };
  },

  async getClient(clientId: string, clientSecret?: string) {
    const client = await clientRepository.findByClientId(clientId);
    
    if (!client || client.type !== ClientType.OAUTH2) {
      return false;
    }

    if (!client.isActive) {
      return false;
    }

    if (clientSecret && client.clientSecret !== clientSecret) {
      return false;
    }

    return OAuth2Provider.clientToOAuth2Client(client);
  },

  async getUser(username: string, password: string) {
    const user = await userRepository.findByEmail(username);
    
    if (!user || !await user.verifyPassword(password)) {
      return false;
    }

    return OAuth2Provider.userToOAuth2User(user);
  },

  async getUserFromClient(client) {
    // For client credentials grant
    return { id: client.id };
  },

  async saveToken(token, client, user) {
    // In a real implementation, you would save the token to the database
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client,
      user
    };
  },

  async saveAuthorizationCode(code, client, user) {
    // In a real implementation, you would save the authorization code to the database
    return {
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client,
      user
    };
  },

  async revokeToken(token) {
    // In a real implementation, you would mark the token as revoked in the database
    return true;
  },

  async revokeAuthorizationCode(code) {
    // In a real implementation, you would mark the authorization code as revoked in the database
    return true;
  },

  async verifyScope(user, client, scope) {
    // In a real implementation, you would check if the user and client have access to the requested scope
    const clientEntity = await clientRepository.findByClientId(client.id);
    return clientEntity ? clientEntity.isScopeAllowed(scope) : false;
  }
};

// Initialize OAuth2 provider
const oauth2Provider = new OAuth2Provider(oauth2Model);

// OAuth2 Authorization endpoint
router.get('/authorize', async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      redirect_uri,
      response_type = 'code',
      scope,
      state
    } = req.query;

    if (!client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'client_id and redirect_uri are required'
      });
    }

    const client = await clientRepository.findByClientId(client_id as string);
    
    if (!client || client.type !== ClientType.OAUTH2) {
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

    // Create authorization URL
    const authUrl = oauth2Provider.getAuthorizationUrl({
      client_id: client_id as string,
      redirect_uri: redirect_uri as string,
      scope: scope as string,
      response_type: response_type as string,
      state: state as string
    });

    // In a real implementation, you would redirect to a login page
    // For this example, we'll return the authorization URL
    res.json({
      message: 'OAuth2 authorization request received',
      authorizationUrl: authUrl,
      loginUrl: `/oauth/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri as string)}&state=${state}&scope=${scope}`
    });
  } catch (error) {
    console.error('OAuth2 authorization error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Authorization request failed'
    });
  }
});

// OAuth2 Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, client_id, redirect_uri, state, scope } = req.body;

    if (!username || !password || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'username, password, client_id, and redirect_uri are required'
      });
    }

    // Authenticate user
    const user = await userRepository.findByEmail(username);
    if (!user || !await user.verifyPassword(password)) {
      return res.status(401).json({
        error: 'invalid_grant',
        error_description: 'Invalid credentials'
      });
    }

    const client = await clientRepository.findByClientId(client_id);
    if (!client || client.type !== ClientType.OAUTH2) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client_id'
      });
    }

    // Create OAuth2 request and response objects
    const request = OAuth2Provider.createRequest({
      method: 'POST',
      query: { client_id, redirect_uri, response_type: 'code', scope, state },
      headers: req.headers,
      body: req.body
    });

    const response = OAuth2Provider.createResponse(res);

    try {
      const code = await oauth2Provider.authorize(request, response, {
        authenticateHandler: {
          handle: async () => OAuth2Provider.userToOAuth2User(user)
        }
      });

      const callbackUrl = new URL(redirect_uri);
      callbackUrl.searchParams.set('code', code.authorizationCode);
      if (state) callbackUrl.searchParams.set('state', state);

      res.json({
        message: 'Authentication successful',
        authorizationCode: code.authorizationCode,
        callbackUrl: callbackUrl.toString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName
        }
      });
    } catch (oauthError) {
      console.error('OAuth2 authorize error:', oauthError);
      res.status(400).json({
        error: 'invalid_request',
        error_description: 'Authorization failed'
      });
    }
  } catch (error) {
    console.error('OAuth2 login error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Login failed'
    });
  }
});

// OAuth2 Token endpoint
router.post('/token', async (req: Request, res: Response) => {
  try {
    const request = OAuth2Provider.createRequest(req);
    const response = OAuth2Provider.createResponse(res);

    try {
      const token = await oauth2Provider.token(request, response);

      res.json({
        access_token: token.accessToken,
        token_type: 'Bearer',
        expires_in: Math.floor((token.accessTokenExpiresAt!.getTime() - Date.now()) / 1000),
        refresh_token: token.refreshToken,
        scope: token.scope
      });
    } catch (oauthError: any) {
      console.error('OAuth2 token error:', oauthError);
      
      const statusCode = oauthError.code || 400;
      res.status(statusCode).json({
        error: oauthError.name || 'invalid_grant',
        error_description: oauthError.message || 'Token request failed'
      });
    }
  } catch (error) {
    console.error('OAuth2 token endpoint error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Token request failed'
    });
  }
});

// OAuth2 Token introspection endpoint
router.post('/introspect', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'token is required'
      });
    }

    const request = OAuth2Provider.createRequest(req);
    const response = OAuth2Provider.createResponse(res);

    try {
      const tokenInfo = await oauth2Provider.authenticate(request, response);

      res.json({
        active: true,
        client_id: tokenInfo.client.id,
        username: tokenInfo.user?.id,
        scope: tokenInfo.scope,
        exp: Math.floor(tokenInfo.accessTokenExpiresAt!.getTime() / 1000)
      });
    } catch (oauthError) {
      res.json({
        active: false
      });
    }
  } catch (error) {
    console.error('OAuth2 introspect error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Token introspection failed'
    });
  }
});

// OAuth2 Token revocation endpoint
router.post('/revoke', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'token is required'
      });
    }

    // In a real implementation, you would revoke the token
    // For this example, we'll just return success
    res.json({
      message: 'Token revoked successfully'
    });
  } catch (error) {
    console.error('OAuth2 revoke error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Token revocation failed'
    });
  }
});

export { router as oauth2Router };