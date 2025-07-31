import { User, UserRepository } from '@naidp/domain';
import { Database } from '../config/database';
import { Knex } from 'knex';

interface UserRow {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class SqlUserRepository implements UserRepository {
  private db: Knex;

  constructor() {
    this.db = Database.getInstance().getKnex();
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db<UserRow>('users').where({ id }).first();
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db<UserRow>('users').where({ email }).first();
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    const data = this.toRow(user);
    await this.db('users')
      .insert(data)
      .onConflict('id')
      .merge(['email', 'password', 'first_name', 'last_name', 'is_active', 'email_verified', 'last_login_at', 'updated_at']);
  }

  async delete(id: string): Promise<void> {
    await this.db('users').where({ id }).delete();
  }

  async findAll(offset = 0, limit = 50): Promise<User[]> {
    const rows = await this.db<UserRow>('users')
      .offset(offset)
      .limit(limit)
      .orderBy('created_at', 'desc');
    
    return rows.map(row => this.toDomain(row));
  }

  async count(): Promise<number> {
    const result = await this.db('users').count('* as count').first();
    return Number(result?.count || 0);
  }

  private toDomain(row: UserRow): User {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      lastLoginAt: row.last_login_at || undefined
    });
  }

  private toRow(user: User): Partial<UserRow> {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      email_verified: user.emailVerified,
      last_login_at: user.lastLoginAt || null,
      updated_at: user.updatedAt
    };
  }
}