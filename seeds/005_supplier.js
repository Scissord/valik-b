/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('supplier').del();

  await knex('supplier').insert([
    {
      id: 1,
      login: 'supplier1',
      // 12345678
      password: '$2a$12$gw5Kxp4vcGhdTNPzDAuufe1rF9gD9nf1v7Ez4o4.L.5PMhxjJgZca'
    },
  ]);

  await knex.raw("SELECT setval('supplier_id_seq', (SELECT MAX(id) FROM supplier))");
};
