import Provider, { Configuration, KoaContextWithOIDC, Account, FindAccount } from 'oidc-provider';
import { User, Client } from '@naidp/domain';
import { JWTUtils } from '../common/jwt';

export interface OIDCConfig {
  issuer: string;
  jwksUri?: string;
  findAccount: FindAccount;
}

export class OIDCProvider {
  private provider: Provider;
  private config: OIDCConfig;

  constructor(config: OIDCConfig) {
    this.config = config;

    const configuration: Configuration = {
      clients: [],
      findAccount: config.findAccount,
      claims: {
        openid: ['sub'],
        email: ['email', 'email_verified'],
        profile: ['name', 'given_name', 'family_name', 'updated_at']
      },
      features: {
        devInteractions: { enabled: false },
        clientCredentials: { enabled: true },
        introspection: { enabled: true },
        revocation: { enabled: true }
      },
      jwks: {
        keys: [
          // In production, use proper key management
          JWTUtils.generateKeyPair()
        ]
      },
      ttl: {
        AccessToken: 60 * 60, // 1 hour
        AuthorizationCode: 10 * 60, // 10 minutes
        IdToken: 60 * 60, // 1 hour
        RefreshToken: 24 * 60 * 60 // 24 hours
      },
      responseTypes: [
        'code',
        'code id_token',
        'code token',
        'code id_token token',
        'id_token',
        'id_token token'
      ],
      scopes: ['openid', 'email', 'profile', 'offline_access'],
      subjectTypes: ['public'],
      tokenEndpointAuthMethods: [
        'client_secret_basic',
        'client_secret_post',
        'client_secret_jwt',
        'private_key_jwt',
        'none'
      ]
    };

    this.provider = new Provider(config.issuer, configuration);
  }

  getProvider(): Provider {
    return this.provider;
  }

  async addClient(client: Client): Promise<void> {
    const clientConfig = {
      client_id: client.clientId,
      client_secret: client.clientSecret,
      grant_types: ['authorization_code', 'refresh_token', 'client_credentials'],
      response_types: ['code'],
      redirect_uris: client.redirectUris,
      scope: client.allowedScopes.join(' '),
      token_endpoint_auth_method: 'client_secret_basic'
    };

    // In a real implementation, this would be stored in the database
    // and loaded dynamically
    await this.provider.Client.store.set(client.clientId, clientConfig);
  }

  async removeClient(clientId: string): Promise<void> {
    await this.provider.Client.store.delete(clientId);
  }

  createAccount(user: User): Account {
    return {
      accountId: user.id,
      async claims(use, scope, claims, rejected) {
        return {
          sub: user.id,
          email: user.email,
          email_verified: user.emailVerified,
          name: user.fullName,
          given_name: user.firstName,
          family_name: user.lastName,
          updated_at: Math.floor(user.updatedAt.getTime() / 1000)
        };
      }
    };
  }

  async getInteractionDetails(ctx: KoaContextWithOIDC): Promise<any> {
    return this.provider.interactionDetails(ctx.req, ctx.res);
  }

  async finishInteraction(ctx: KoaContextWithOIDC, result: any): Promise<void> {
    await this.provider.interactionFinished(ctx.req, ctx.res, result);
  }

  getAuthorizationUrl(params: {
    client_id: string;
    redirect_uri: string;
    scope?: string;
    response_type?: string;
    state?: string;
  }): string {
    const query = new URLSearchParams({
      response_type: params.response_type || 'code',
      client_id: params.client_id,
      redirect_uri: params.redirect_uri,
      scope: params.scope || 'openid email profile',
      ...(params.state && { state: params.state })
    });

    return `${this.config.issuer}/auth?${query.toString()}`;
  }
}