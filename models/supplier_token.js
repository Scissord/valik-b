import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const supplierTokenRepository = repository('supplier_token');

export const get = async () => {
  return await supplierTokenRepository.getActive();
};

export const create = async data => {
  return await supplierTokenRepository.create(data);
};

export const update = async (id, data) => {
  return await supplierTokenRepository.update(id, data);
};

export const softDelete = async id => {
  return await supplierTokenRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await supplierTokenRepository.hardDelete(id);
};

export const find = async id => {
  return await supplierTokenRepository.find(id);
};

export const findWhere = async function (query) {
  return await supplierTokenRepository.findWhere(query);
};

export const findWhereActive = async function (query) {
  return await supplierTokenRepository.findWhereActive(query);
};
