import OAuth2Server from 'oauth2-server';
import { User, Client } from '@naidp/domain';

export interface OAuth2Model {
  getAccessToken(accessToken: string): Promise<OAuth2Server.Token | false>;
  getRefreshToken(refreshToken: string): Promise<OAuth2Server.RefreshToken | false>;
  getAuthorizationCode(authorizationCode: string): Promise<OAuth2Server.AuthorizationCode | false>;
  getClient(clientId: string, clientSecret?: string): Promise<OAuth2Server.Client | false>;
  getUser(username: string, password: string): Promise<OAuth2Server.User | false>;
  getUserFromClient(client: OAuth2Server.Client): Promise<OAuth2Server.User | false>;
  saveToken(token: OAuth2Server.Token, client: OAuth2Server.Client, user: OAuth2Server.User): Promise<OAuth2Server.Token>;
  saveAuthorizationCode(code: OAuth2Server.AuthorizationCode, client: OAuth2Server.Client, user: OAuth2Server.User): Promise<OAuth2Server.AuthorizationCode>;
  revokeToken(token: OAuth2Server.Token): Promise<boolean>;
  revokeAuthorizationCode(code: OAuth2Server.AuthorizationCode): Promise<boolean>;
  verifyScope(user: OAuth2Server.User, client: OAuth2Server.Client, scope: string): Promise<boolean>;
}

export class OAuth2Provider {
  private server: OAuth2Server;

  constructor(model: OAuth2Model) {
    this.server = new OAuth2Server({
      model,
      grants: [
        'authorization_code',
        'client_credentials',
        'refresh_token',
        'password'
      ],
      accessTokenLifetime: 60 * 60, // 1 hour
      refreshTokenLifetime: 60 * 60 * 24 * 14, // 2 weeks
      authorizationCodeLifetime: 5 * 60, // 5 minutes
      allowEmptyState: false,
      allowExtendedTokenAttributes: true
    });
  }

  getServer(): OAuth2Server {
    return this.server;
  }

  async authorize(request: OAuth2Server.Request, response: OAuth2Server.Response, options?: OAuth2Server.AuthorizeOptions): Promise<OAuth2Server.AuthorizationCode> {
    return this.server.authorize(request, response, options);
  }

  async token(request: OAuth2Server.Request, response: OAuth2Server.Response, options?: OAuth2Server.TokenOptions): Promise<OAuth2Server.Token> {
    return this.server.token(request, response, options);
  }

  async authenticate(request: OAuth2Server.Request, response: OAuth2Server.Response, options?: OAuth2Server.AuthenticateOptions): Promise<OAuth2Server.Token> {
    return this.server.authenticate(request, response, options);
  }

  static createRequest(req: any): OAuth2Server.Request {
    return new OAuth2Server.Request({
      method: req.method,
      query: req.query,
      headers: req.headers,
      body: req.body
    });
  }

  static createResponse(res: any): OAuth2Server.Response {
    return new OAuth2Server.Response({
      headers: res.getHeaders?.() || {}
    });
  }

  static userToOAuth2User(user: User): OAuth2Server.User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
  }

  static clientToOAuth2Client(client: Client): OAuth2Server.Client {
    return {
      id: client.clientId,
      redirectUris: client.redirectUris,
      grants: ['authorization_code', 'client_credentials', 'refresh_token'],
      accessTokenLifetime: 3600,
      refreshTokenLifetime: 1209600
    };
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
      ...(params.scope && { scope: params.scope }),
      ...(params.state && { state: params.state })
    });

    return `/oauth/authorize?${query.toString()}`;
  }
}