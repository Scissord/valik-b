/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('unit').del();

  await knex('unit').insert([
    {
      id: 1,
      title: 'Ед.изм 1'
    },
    {
      id: 2,
      title: 'Ед.изм 2'
    },
    {
      id: 3,
      title: 'Ед.изм 3'
    }
  ]);

  await knex.raw("SELECT setval('unit_id_seq', (SELECT MAX(id) FROM unit))");
};
