/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('supplier').del();

  await knex('supplier').insert([
    {
      id: 1,
      login: 'n10',
      // superstrongpass666@
      password: '$2a$10$qNQxTkJL1VIP4ox.PEygt.V87bCO//D8hc3S8B6c82PBK4TcGuqs.',
    },
  ]);

  await knex.raw("SELECT setval('supplier_id_seq', (SELECT MAX(id) FROM supplier))");
};
