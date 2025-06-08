import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const supplierRepository = repository('supplier');

export const get = async () => {
  return await supplierRepository.getActive();
};

export const create = async data => {
  return await supplierRepository.create(data);
};

export const update = async (id, data) => {
  return await supplierRepository.update(id, data);
};

export const softDelete = async id => {
  return await supplierRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await supplierRepository.hardDelete(id);
};

export const find = async id => {
  return await supplierRepository.find(id);
};

export const findWhere = async function (query) {
  return await supplierRepository.findWhere(query);
};

export const findWhereActive = async function (query) {
  return await supplierRepository.findWhereActive(query);
};
