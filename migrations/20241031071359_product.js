/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('product', table => {
    table.bigIncrements('id').primary();
    table.string('title', 255).notNullable();
    table.string('description', 500).notNullable();
    table.integer('brand_id').notNullable();
    table.integer('unit_id').notNullable();
    table.integer('category_id').notNullable();
    table.tinyint('rating').defaultTo(0);
    table.integer('article').nullable();

    table.decimal('length', 10, 2).nullable();
    table.decimal('width', 10, 2).nullable();
    table.decimal('height', 10, 2).nullable();
    table.decimal('weight', 10, 2).nullable();
    table.decimal('depth', 10, 2).nullable();
    table.integer('price').defaultTo(0);

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
  return knex.schema.dropTable('product');
};
