import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.datetime('last_login_at').nullable();
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['is_active']);
  });

  // Clients table
  await knex.schema.createTable('clients', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.enum('type', ['saml', 'oidc', 'oauth2']).notNullable();
    table.string('client_id').unique().notNullable();
    table.string('client_secret').nullable();
    table.json('redirect_uris').notNullable();
    table.json('allowed_scopes').notNullable();
    table.json('metadata').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['client_id']);
    table.index(['type']);
    table.index(['is_active']);
  });

  // Sessions table (for OIDC/OAuth2)
  await knex.schema.createTable('sessions', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('client_id').references('id').inTable('clients').onDelete('CASCADE');
    table.json('data').notNullable();
    table.datetime('expires_at').notNullable();
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['client_id']);
    table.index(['expires_at']);
  });

  // Authorization codes table
  await knex.schema.createTable('authorization_codes', (table) => {
    table.string('id').primary();
    table.string('code').unique().notNullable();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('client_id').references('id').inTable('clients').onDelete('CASCADE');
    table.string('redirect_uri').notNullable();
    table.json('scopes').notNullable();
    table.datetime('expires_at').notNullable();
    table.timestamps(true, true);
    
    table.index(['code']);
    table.index(['user_id']);
    table.index(['client_id']);
    table.index(['expires_at']);
  });

  // Access tokens table
  await knex.schema.createTable('access_tokens', (table) => {
    table.string('id').primary();
    table.string('token').unique().notNullable();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('client_id').references('id').inTable('clients').onDelete('CASCADE');
    table.json('scopes').notNullable();
    table.datetime('expires_at').notNullable();
    table.timestamps(true, true);
    
    table.index(['token']);
    table.index(['user_id']);
    table.index(['client_id']);
    table.index(['expires_at']);
  });

  // Refresh tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.string('id').primary();
    table.string('token').unique().notNullable();
    table.string('access_token_id').references('id').inTable('access_tokens').onDelete('CASCADE');
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('client_id').references('id').inTable('clients').onDelete('CASCADE');
    table.datetime('expires_at').notNullable();
    table.timestamps(true, true);
    
    table.index(['token']);
    table.index(['access_token_id']);
    table.index(['user_id']);
    table.index(['client_id']);
    table.index(['expires_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('access_tokens');
  await knex.schema.dropTableIfExists('authorization_codes');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('clients');
  await knex.schema.dropTableIfExists('users');
}