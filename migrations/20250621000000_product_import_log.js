/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  const hasTable = await knex.schema.hasTable('product_import_log');
  if (hasTable) return;

  await knex.schema.createTable('product_import_log', table => {
    table.bigIncrements('id').primary();
    table.bigInteger('supplier_id').notNullable();
    table.string('status', 50).notNullable();
    table.integer('row_count').defaultTo(0);
    table.jsonb('errors').defaultTo(knex.raw(`'[]'::jsonb`));

    table
      .bigInteger('created_at')
      .defaultTo(knex.raw('(EXTRACT(EPOCH FROM NOW()) * 1000)::bigint'));
    table
      .bigInteger('updated_at')
      .defaultTo(knex.raw('(EXTRACT(EPOCH FROM NOW()) * 1000)::bigint'));
    table.bigInteger('deleted_at').nullable();

    table.foreign('supplier_id').references('supplier.id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTable('product_import_log');
};
