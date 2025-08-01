import { Client, ClientRepository, ClientType } from '@naidp/domain';
import { Database } from '../config/database';
import { Knex } from 'knex';

interface ClientRow {
  id: string;
  name: string;
  type: ClientType;
  client_id: string;
  client_secret: string | null;
  redirect_uris: string;
  allowed_scopes: string;
  metadata: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class SqlClientRepository implements ClientRepository {
  private db: Knex;

  constructor() {
    this.db = Database.getInstance().getKnex();
  }

  async findById(id: string): Promise<Client | null> {
    const row = await this.db<ClientRow>('clients').where({ id }).first();
    return row ? this.toDomain(row) : null;
  }

  async findByClientId(clientId: string): Promise<Client | null> {
    const row = await this.db<ClientRow>('clients').where({ client_id: clientId }).first();
    return row ? this.toDomain(row) : null;
  }

  async save(client: Client): Promise<void> {
    const data = this.toRow(client);
    await this.db('clients')
      .insert(data)
      .onConflict('id')
      .merge(['name', 'type', 'client_secret', 'redirect_uris', 'allowed_scopes', 'metadata', 'is_active', 'updated_at']);
  }

  async delete(id: string): Promise<void> {
    await this.db('clients').where({ id }).delete();
  }

  async findAll(offset = 0, limit = 50): Promise<Client[]> {
    const rows = await this.db<ClientRow>('clients')
      .offset(offset)
      .limit(limit)
      .orderBy('created_at', 'desc');
    
    return rows.map(row => this.toDomain(row));
  }

  async findByType(type: string): Promise<Client[]> {
    const rows = await this.db<ClientRow>('clients')
      .where({ type: type as ClientType })
      .orderBy('created_at', 'desc');
    
    return rows.map(row => this.toDomain(row));
  }

  async count(): Promise<number> {
    const result = await this.db('clients').count('* as count').first();
    return Number(result?.count || 0);
  }

  private toDomain(row: ClientRow): Client {
    return new Client({
      id: row.id,
      name: row.name,
      type: row.type,
      clientId: row.client_id,
      clientSecret: row.client_secret || undefined,
      redirectUris: JSON.parse(row.redirect_uris),
      allowedScopes: JSON.parse(row.allowed_scopes),
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      isActive: row.is_active
    });
  }

  private toRow(client: Client): Partial<ClientRow> {
    return {
      id: client.id,
      name: client.name,
      type: client.type,
      client_id: client.clientId,
      client_secret: client.clientSecret || null,
      redirect_uris: JSON.stringify(client.redirectUris),
      allowed_scopes: JSON.stringify(client.allowedScopes),
      metadata: JSON.stringify(client.metadata),
      is_active: client.isActive,
      updated_at: client.updatedAt
    };
  }
}