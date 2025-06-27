/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('user', table => {
    table.bigIncrements('id').primary();
    table.string('login', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('full_name', 255).notNullable();
    table.string('phone', 20).nullable();
    table.string('telegram_id', 50).nullable();
    table.enum('role', ['client', 'manager', 'admin']).defaultTo('client').notNullable();
    table.bigInteger('birth_date').nullable();
    table.enum('gender', ['male', 'female']).nullable();
    table.text('address').nullable();

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
  return knex.schema.dropTable('user');
};
