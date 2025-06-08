import knex from './knex.js';
import repository from './repository.js';

const orderItemRepository = repository('order_item');
const db = knex();

export const getForDebts = async (client_id, manager_id) => {
  const request = await db('request as r')
    .where('r.client_id', client_id)
    .andWhere('r.manager_id', manager_id)
    .orderBy('r.id', 'desc')
    .first()
    .select('r.id');

  if (!request) return [];

  const order_items = await db('order_item as oi')
    .select('oi.*')
    .join('request as r', 'r.order_id', 'oi.order_id')
    .andWhere('r.id', request.id)
    .whereNull('oi.deleted_at')
    .orderBy('oi.id', 'asc');

  return order_items;
};

export const getByOrderId = async order_id => {
  return await db('order_item as oi')
    .select('oi.*')
    .where('oi.order_id', order_id)
    .andWhere('oi.deleted_at', null)
    .orderBy('oi.id', 'asc');
};

export const getByOrderIdBeforeShipment = async order_id => {
  return await db('order_item as oi')
    .select('oi.*')
    .where('oi.order_id', order_id)
    .andWhere('oi.deleted_at', null)
    .whereNotIn('oi.status', [3, 4, 5, 6])
    .orderBy('oi.id', 'asc');
};

export const create = async data => {
  return await orderItemRepository.create(data);
};

export const update = async (id, data) => {
  return await orderItemRepository.update(id, data);
};

export const updateWhere = async (query, data) => {
  return await orderItemRepository.updateWhere(query, data);
};

export const softDelete = async id => {
  return await orderItemRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await orderItemRepository.hardDelete(id);
};

export const find = async id => {
  return await orderItemRepository.find(id);
};

export const findWhere = async function (query) {
  return await orderItemRepository.findWhere(query);
};
