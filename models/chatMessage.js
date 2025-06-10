import knex from './knex.js';

const db = knex();

export const create = async (data) => {
  const result = await db('chat_message').insert(data).returning('*');
  return result[0];
};

export const createMany = async (messages) => {
  return await db('chat_message').insert(messages).returning('*');
};

export const getByChatId = async (chatId) => {
  return await db('chat_message')
    .where('chat_id', chatId)
    .orderBy('created_at', 'asc');
}; 