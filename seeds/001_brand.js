/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('brand').del();

  await knex('brand').insert([
    {
      id: 1,
      title: 'Бренд 1'
    },
    {
      id: 2,
      title: 'Бренд 2'
    },
    {
      id: 3,
      title: 'Бренд 3'
    }
  ]);

  await knex.raw("SELECT setval('brand_id_seq', (SELECT MAX(id) FROM brand))");
};
