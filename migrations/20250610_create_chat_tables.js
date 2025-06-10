export function up(knex) {
  return knex.schema
    // Сначала создаем таблицу чатов
    .createTable('chat', (table) => {
      table.increments('id').primary();
      table.integer('user_id').nullable();
      table.string('title').nullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      table.timestamp('deleted_at').nullable();
    })
    // Затем создаем таблицу сообщений с внешним ключом
    .then(() => {
      return knex.schema.createTable('chat_message', (table) => {
        table.increments('id').primary();
        table.integer('chat_id').references('id').inTable('chat').onDelete('CASCADE');
        table.enum('role', ['system', 'user', 'assistant']).notNullable();
        table.text('content').notNullable();
        table.timestamps(true, true);
      });
    });
}

export function down(knex) {
  // Удаляем таблицы в обратном порядке
  return knex.schema
    .dropTable('chat_message')
    .then(() => {
      return knex.schema.dropTable('chat');
    });
} 