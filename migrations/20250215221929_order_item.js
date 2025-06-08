/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('order_item', table => {
    table.bigIncrements('id').primary();
    table.uuid('order_id').notNullable();
    table.integer('product_id').notNullable();
    table.integer('quantity').defaultTo(0);
    table.bigInteger('total').defaultTo(0);

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
  return knex.schema.dropTable('order_item');
};
