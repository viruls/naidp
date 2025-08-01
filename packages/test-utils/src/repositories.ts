import { UserRepository, ClientRepository } from '@naidp/domain';
import { User, Client } from '@naidp/domain';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async findAll(offset = 0, limit = 50): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    return allUsers.slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  clear(): void {
    this.users.clear();
  }
}

export class InMemoryClientRepository implements ClientRepository {
  private clients: Map<string, Client> = new Map();

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async findByClientId(clientId: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.clientId === clientId) {
        return client;
      }
    }
    return null;
  }

  async save(client: Client): Promise<void> {
    this.clients.set(client.id, client);
  }

  async delete(id: string): Promise<void> {
    this.clients.delete(id);
  }

  async findAll(offset = 0, limit = 50): Promise<Client[]> {
    const allClients = Array.from(this.clients.values());
    return allClients.slice(offset, offset + limit);
  }

  async findByType(type: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.type === type);
  }

  async count(): Promise<number> {
    return this.clients.size;
  }

  clear(): void {
    this.clients.clear();
  }
}