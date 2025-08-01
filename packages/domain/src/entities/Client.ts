import { Entity } from './Entity';

export enum ClientType {
  SAML = 'saml',
  OIDC = 'oidc',
  OAUTH2 = 'oauth2'
}

export interface ClientProps {
  id?: string;
  name: string;
  type: ClientType;
  clientId: string;
  clientSecret?: string;
  redirectUris: string[];
  allowedScopes: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export class Client extends Entity {
  private _name: string;
  private _type: ClientType;
  private _clientId: string;
  private _clientSecret?: string;
  private _redirectUris: string[];
  private _allowedScopes: string[];
  private _metadata: Record<string, any>;
  private _isActive: boolean;

  constructor(props: ClientProps) {
    super(props.id);
    this._name = props.name;
    this._type = props.type;
    this._clientId = props.clientId;
    this._clientSecret = props.clientSecret;
    this._redirectUris = props.redirectUris;
    this._allowedScopes = props.allowedScopes;
    this._metadata = props.metadata || {};
    this._isActive = props.isActive ?? true;
  }

  get name(): string {
    return this._name;
  }

  get type(): ClientType {
    return this._type;
  }

  get clientId(): string {
    return this._clientId;
  }

  get clientSecret(): string | undefined {
    return this._clientSecret;
  }

  get redirectUris(): string[] {
    return [...this._redirectUris];
  }

  get allowedScopes(): string[] {
    return [...this._allowedScopes];
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateName(name: string): void {
    this._name = name;
    this.touch();
  }

  updateRedirectUris(uris: string[]): void {
    this._redirectUris = [...uris];
    this.touch();
  }

  updateAllowedScopes(scopes: string[]): void {
    this._allowedScopes = [...scopes];
    this.touch();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...metadata };
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  rotateSecret(newSecret: string): void {
    this._clientSecret = newSecret;
    this.touch();
  }

  isRedirectUriAllowed(uri: string): boolean {
    return this._redirectUris.includes(uri);
  }

  isScopeAllowed(scope: string): boolean {
    return this._allowedScopes.includes(scope);
  }
}