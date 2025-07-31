import knex, { Knex } from 'knex';

export interface DatabaseConfig {
  client: 'sqlite3' | 'postgresql';
  connection: string | {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  useNullAsDefault?: boolean;
  migrations?: {
    directory: string;
  };
}

export class Database {
  private static instance: Database;
  private knex: Knex;

  private constructor(config: DatabaseConfig) {
    this.knex = knex(config);
  }

  static getInstance(config?: DatabaseConfig): Database {
    if (!Database.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      Database.instance = new Database(config);
    }
    return Database.instance;
  }

  getKnex(): Knex {
    return this.knex;
  }

  async migrate(): Promise<void> {
    await this.knex.migrate.latest();
  }

  async seed(): Promise<void> {
    await this.knex.seed.run();
  }

  async destroy(): Promise<void> {
    await this.knex.destroy();
  }

  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.knex.transaction(callback);
  }
}

export function getDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isProduction && process.env.DATABASE_URL) {
    return {
      client: 'postgresql',
      connection: process.env.DATABASE_URL,
      migrations: {
        directory: './dist/migrations'
      }
    };
  }

  if (isDevelopment && process.env.DATABASE_URL_DEV) {
    return {
      client: 'sqlite3',
      connection: process.env.DATABASE_URL_DEV,
      useNullAsDefault: true,
      migrations: {
        directory: './dist/migrations'
      }
    };
  }

  // Default to SQLite for development
  return {
    client: 'sqlite3',
    connection: './dev.db',
    useNullAsDefault: true,
    migrations: {
      directory: './dist/migrations'
    }
  };
}