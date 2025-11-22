/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('product').del();
  await knex.raw(`SELECT setval('product_id_seq', 1, false)`);
  await knex('product_import_log').del();
  await knex.raw(`SELECT setval('product_import_log_id_seq', 1, false)`);
  await knex('category').del();
  await knex.raw(`SELECT setval('category_id_seq', 1, false)`);
  await knex('brand').del();
  await knex.raw(`SELECT setval('brand_id_seq', 1, false)`);
  await knex('unit').del();
  await knex.raw(`SELECT setval('unit_id_seq', 1, false)`);
  await knex('supplier').del();
  await knex.raw(`SELECT setval('supplier_id_seq', 1, false)`);
  await knex('supplier_token').del();
  await knex.raw(`SELECT setval('supplier_token_id_seq', 1, false)`);
  await knex('user').del();
  await knex.raw(`SELECT setval('user_id_seq', 1, false)`);
  await knex('user_token').del();
  await knex.raw(`SELECT setval('user_token_id_seq', 1, false)`);
  await knex('file').del();
  await knex.raw(`SELECT setval('file_id_seq', 1, false)`);
  await knex('product_image').del();
  await knex.raw(`SELECT setval('product_image_id_seq', 1, false)`);
};
