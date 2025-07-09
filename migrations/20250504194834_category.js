/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('category', table => {
    table.bigIncrements('id').primary();
    table.string('title', 100).notNullable();
    table.integer('parent_id').nullable();

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
  return knex.schema.dropTable('category');
};
