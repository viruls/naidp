import { Client } from '../entities/Client';

export interface ClientRepository {
  findById(id: string): Promise<Client | null>;
  findByClientId(clientId: string): Promise<Client | null>;
  save(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(offset?: number, limit?: number): Promise<Client[]>;
  findByType(type: string): Promise<Client[]>;
  count(): Promise<number>;
}