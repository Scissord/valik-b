import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const chatRepository = repository('chat');

export const create = async (data) => {
  return await chatRepository.create(data);
};

export const find = async (id) => {
  return await chatRepository.find(id);
};

export const update = async (id, data) => {
  return await chatRepository.update(id, data);
};

export const getMessages = async (chatId) => {
  return await db('chat_message')
    .where('chat_id', chatId)
    .orderBy('created_at', 'asc');
};

export const softDelete = async (id) => {
  // Используем текущую дату в формате ISO, который поддерживается PostgreSQL
  const deleted_at = new Date().toISOString();
  
  // Обновляем запись напрямую, минуя репозиторий
  const [deletedRecord] = await db('chat')
    .where('id', id)
    .update({ deleted_at })
    .returning('*');
  
  return deletedRecord;
};

export const getChatsForUser = async (userId) => {
  return await db('chat')
    .where('user_id', userId)
    .whereNull('deleted_at')
    .orderBy('updated_at', 'desc');
}; 