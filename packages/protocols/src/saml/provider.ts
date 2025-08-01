import * as samlify from 'samlify';
import { User, Client } from '@naidp/domain';

export interface SAMLConfig {
  issuer: string;
  callbackUrl: string;
  certPath?: string;
  keyPath?: string;
  cert?: string;
  key?: string;
}

export class SAMLProvider {
  private idp: samlify.IdentityProvider;
  private config: SAMLConfig;

  constructor(config: SAMLConfig) {
    this.config = config;
    
    this.idp = samlify.IdentityProvider({
      entityID: config.issuer,
      nameIDFormat: ['urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'],
      singleSignOnService: [{
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: `${config.issuer}/auth/saml/sso`
      }],
      singleLogoutService: [{
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: `${config.issuer}/auth/saml/slo`
      }],
      signingCert: config.cert,
      privateKey: config.key
    });
  }

  createServiceProvider(client: Client): samlify.ServiceProvider {
    const metadata = client.metadata as any;
    
    return samlify.ServiceProvider({
      entityID: metadata.entityID || client.clientId,
      assertionConsumerService: client.redirectUris.map(uri => ({
        Binding: samlify.Constants.namespace.binding.post,
        Location: uri
      })),
      singleLogoutService: metadata.singleLogoutService ? [{
        Binding: samlify.Constants.namespace.binding.redirect,
        Location: metadata.singleLogoutService
      }] : undefined
    });
  }

  async createLoginRequest(sp: samlify.ServiceProvider, relayState?: string): Promise<{ url: string; id: string }> {
    const { context } = this.idp.createLoginRequest(sp, 'redirect', (template) => {
      return {
        id: template.id,
        context: template.context
      };
    });

    return {
      url: context,
      id: context.split('ID=')[1]?.split('&')[0] || ''
    };
  }

  async createLoginResponse(
    sp: samlify.ServiceProvider, 
    user: User, 
    inResponseTo?: string,
    relayState?: string
  ): Promise<{ response: string; postUrl: string }> {
    const attributes = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id
    };

    const { context } = this.idp.createLoginResponse(sp, null, 'post', user.email, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id
    }, undefined, relayState, (template) => {
      return {
        id: template.id,
        context: template.context,
        entityEndpoint: template.entityEndpoint
      };
    });

    return {
      response: context.context,
      postUrl: context.entityEndpoint
    };
  }

  async parseLoginRequest(request: string, sp: samlify.ServiceProvider): Promise<{
    id: string;
    issuer: string;
    destination: string;
  }> {
    const { extract } = await this.idp.parseLoginRequest(sp, 'redirect', { query: { SAMLRequest: request } });
    
    return {
      id: extract.request.id,
      issuer: extract.request.issuer,
      destination: extract.request.destination
    };
  }

  getMetadata(): string {
    return this.idp.getMetadata();
  }
}