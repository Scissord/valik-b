/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('order', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('phone', 255).notNullable();
    table.bigInteger('total').defaultTo(0);
    table.tinyint('status').defaultTo(0);

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
  return knex.schema.dropTable('order');
};
