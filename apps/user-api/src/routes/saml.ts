import { Router, Request, Response } from 'express';
import { SAMLProvider } from '@naidp/protocols';
import { SqlClientRepository, SqlUserRepository } from '@naidp/db';
import { ClientType } from '@naidp/domain';

const router = Router();
const clientRepository = new SqlClientRepository();
const userRepository = new SqlUserRepository();

// Initialize SAML provider
const samlProvider = new SAMLProvider({
  issuer: process.env.SAML_ISSUER || 'https://naidp.example.com',
  callbackUrl: process.env.SAML_CALLBACK_URL || 'https://naidp.example.com/auth/saml/callback',
  cert: process.env.SAML_CERT || 'dummy-cert-for-development',
  key: process.env.SAML_KEY || 'dummy-key-for-development'
});

// SAML metadata endpoint
router.get('/metadata', async (req: Request, res: Response) => {
  try {
    const metadata = samlProvider.getMetadata();
    res.type('application/xml');
    res.send(metadata);
  } catch (error) {
    console.error('SAML metadata error:', error);
    res.status(500).json({
      error: 'SAML_ERROR',
      message: 'Failed to generate SAML metadata'
    });
  }
});

// SAML SSO initiation endpoint
router.get('/sso', async (req: Request, res: Response) => {
  try {
    const { client_id, relay_state } = req.query;

    if (!client_id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'client_id is required'
      });
    }

    const client = await clientRepository.findByClientId(client_id as string);
    
    if (!client || client.type !== ClientType.SAML) {
      return res.status(404).json({
        error: 'CLIENT_NOT_FOUND',
        message: 'SAML client not found'
      });
    }

    if (!client.isActive) {
      return res.status(403).json({
        error: 'CLIENT_INACTIVE',
        message: 'SAML client is inactive'
      });
    }

    const sp = samlProvider.createServiceProvider(client);
    const { url } = await samlProvider.createLoginRequest(sp, relay_state as string);

    res.redirect(url);
  } catch (error) {
    console.error('SAML SSO error:', error);
    res.status(500).json({
      error: 'SAML_ERROR',
      message: 'SAML SSO initiation failed'
    });
  }
});

// SAML login request handler
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { SAMLRequest, RelayState } = req.body;
    const client_id = req.query.client_id as string;

    if (!SAMLRequest || !client_id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'SAMLRequest and client_id are required'
      });
    }

    const client = await clientRepository.findByClientId(client_id);
    
    if (!client || client.type !== ClientType.SAML) {
      return res.status(404).json({
        error: 'CLIENT_NOT_FOUND',
        message: 'SAML client not found'
      });
    }

    const sp = samlProvider.createServiceProvider(client);
    const requestInfo = await samlProvider.parseLoginRequest(SAMLRequest, sp);

    // In a real implementation, you would redirect to a login page
    // For this example, we'll return the parsed request info
    res.json({
      message: 'SAML login request received',
      requestId: requestInfo.id,
      issuer: requestInfo.issuer,
      destination: requestInfo.destination,
      relayState: RelayState,
      loginUrl: `/auth/saml/authenticate?request_id=${requestInfo.id}&client_id=${client_id}`
    });
  } catch (error) {
    console.error('SAML login request error:', error);
    res.status(500).json({
      error: 'SAML_ERROR',
      message: 'Failed to process SAML login request'
    });
  }
});

// SAML authentication endpoint (after user login)
router.post('/authenticate', async (req: Request, res: Response) => {
  try {
    const { email, password, request_id, client_id, relay_state } = req.body;

    if (!email || !password || !client_id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'email, password, and client_id are required'
      });
    }

    // Authenticate user
    const user = await userRepository.findByEmail(email);
    if (!user || !await user.verifyPassword(password)) {
      return res.status(401).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Invalid credentials'
      });
    }

    const client = await clientRepository.findByClientId(client_id);
    if (!client || client.type !== ClientType.SAML) {
      return res.status(404).json({
        error: 'CLIENT_NOT_FOUND',
        message: 'SAML client not found'
      });
    }

    const sp = samlProvider.createServiceProvider(client);
    const { response, postUrl } = await samlProvider.createLoginResponse(
      sp, 
      user, 
      request_id, 
      relay_state
    );

    // Return SAML response for POST binding
    res.json({
      samlResponse: response,
      postUrl,
      relayState: relay_state
    });
  } catch (error) {
    console.error('SAML authentication error:', error);
    res.status(500).json({
      error: 'SAML_ERROR',
      message: 'SAML authentication failed'
    });
  }
});

// SAML callback endpoint (ACS - Assertion Consumer Service)
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { SAMLResponse, RelayState } = req.body;

    if (!SAMLResponse) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'SAMLResponse is required'
      });
    }

    // In a real implementation, you would validate the SAML response
    // and extract user information
    res.json({
      message: 'SAML response received successfully',
      relayState: RelayState
    });
  } catch (error) {
    console.error('SAML callback error:', error);
    res.status(500).json({
      error: 'SAML_ERROR',
      message: 'SAML callback failed'
    });
  }
});

export { router as samlRouter };