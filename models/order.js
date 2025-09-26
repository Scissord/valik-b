import knex from './knex.js';
import repository from './repository.js';

const orderRepository = repository('order');
const db = knex();

export const get = async client_id => {
  return await db('order as o')
    .select('o.*')
    .distinctOn('o.product_id')
    .orderBy([
      { column: 'o.product_id', order: 'asc' },
      { column: 'o.id', order: 'desc' }
    ])
    .where('o.deleted_at', null)
    .andWhere('o.client_id', client_id);
};

export const getWhere = async query => {
  return await orderRepository.getWhere(query);
};

export const create = async data => {
  return await orderRepository.create(data);
};

export const update = async (id, data) => {
  return await orderRepository.update(id, data);
};

export const softDelete = async id => {
  return await orderRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await orderRepository.hardDelete(id);
};

export const find = async id => {
  return await orderRepository.find(id);
};

export const findWhere = async function (query) {
  return await orderRepository.findWhere(query);
};

export const updateStatusIfAllItems = async (order_id, targetStatus) => {
  // Обновляем статус заказа только если все позиции доставлены (статус 4)
  if (+targetStatus !== 4) return null;

  const [{ count: total }] = await db('order_item')
    .where({ order_id })
    .andWhere('deleted_at', null)
    .count('*');
  const [{ count: delivered }] = await db('order_item')
    .where({ order_id, status: 4 })
    .andWhere('deleted_at', null)
    .count('*');

  if (+total === 0) return null;

  if (+total === +delivered) {
    return await update(order_id, { status: 4 });
  }
  return null;
};