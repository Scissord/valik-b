/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('supplier').del();

  await knex('supplier').insert([
    {
      id: 1,
      login: 'Поставщик 1',
      password: '$2a$12$Tmpo8xhElWiGRgTOPMPGa.iep.93eYhY2cwv5VZ07GB1fgQE1Rm1G'
    },
    {
      id: 2,
      login: 'Поставщик 2',
      password: '$2a$12$Tmpo8xhElWiGRgTOPMPGa.iep.93eYhY2cwv5VZ07GB1fgQE1Rm1G'
    },
    {
      id: 3,
      login: 'Поставщик 3',
      password: '$2a$12$Tmpo8xhElWiGRgTOPMPGa.iep.93eYhY2cwv5VZ07GB1fgQE1Rm1G'
    }
  ]);

  await knex.raw("SELECT setval('supplier_id_seq', (SELECT MAX(id) FROM supplier))");
};
