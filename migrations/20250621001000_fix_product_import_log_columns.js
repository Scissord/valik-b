/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  const hasRowCount = await knex.schema.hasColumn('product_import_log', 'row_count');
  if (!hasRowCount) {
    await knex.schema.alterTable('product_import_log', table => {
      table.integer('row_count').defaultTo(0);
    });
  }

  const hasErrors = await knex.schema.hasColumn('product_import_log', 'errors');
  if (!hasErrors) {
    await knex.schema.alterTable('product_import_log', table => {
      table.jsonb('errors').defaultTo(knex.raw(`'[]'::jsonb`));
    });
  }

  const hasUpdatedAt = await knex.schema.hasColumn('product_import_log', 'updated_at');
  if (!hasUpdatedAt) {
    await knex.schema.alterTable('product_import_log', table => {
      table
        .bigInteger('updated_at')
        .defaultTo(knex.raw('(EXTRACT(EPOCH FROM NOW()) * 1000)::bigint'));
    });
  }

  const hasCreatedAt = await knex.schema.hasColumn('product_import_log', 'created_at');
  if (!hasCreatedAt) {
    await knex.schema.alterTable('product_import_log', table => {
      table
        .bigInteger('created_at')
        .defaultTo(knex.raw('(EXTRACT(EPOCH FROM NOW()) * 1000)::bigint'));
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  const hasRowCount = await knex.schema.hasColumn('product_import_log', 'row_count');
  if (hasRowCount) {
    await knex.schema.alterTable('product_import_log', table => {
      table.dropColumn('row_count');
    });
  }

  const hasErrors = await knex.schema.hasColumn('product_import_log', 'errors');
  if (hasErrors) {
    await knex.schema.alterTable('product_import_log', table => {
      table.dropColumn('errors');
    });
  }

  const hasUpdatedAt = await knex.schema.hasColumn('product_import_log', 'updated_at');
  if (hasUpdatedAt) {
    await knex.schema.alterTable('product_import_log', table => {
      table.dropColumn('updated_at');
    });
  }

  const hasCreatedAt = await knex.schema.hasColumn('product_import_log', 'created_at');
  if (hasCreatedAt) {
    await knex.schema.alterTable('product_import_log', table => {
      table.dropColumn('created_at');
    });
  }
};
