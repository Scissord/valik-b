/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('user_token', table => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').notNullable();
    table.string('refresh_token', 255).notNullable();
    table.bigInteger('expires_at').notNullable();

    table
      .bigInteger('created_at')
      .defaultTo(knex.raw('(EXTRACT(EPOCH FROM NOW()) * 1000)::bigint'));
    table
      .bigInteger('updated_at')
      .defaultTo(knex.raw('(EXTRACT(EPOCH FROM NOW()) * 1000)::bigint'));
    table.bigInteger('deleted_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTable('user_token');
};
