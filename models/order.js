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
