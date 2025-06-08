import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const unitRepository = repository('unit');

export const get = async () => {
  return await unitRepository.getActive();
};

export const create = async data => {
  return await unitRepository.create(data);
};

export const update = async (id, data) => {
  return await unitRepository.update(id, data);
};

export const softDelete = async id => {
  return await unitRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await unitRepository.hardDelete(id);
};

export const find = async id => {
  return await unitRepository.find(id);
};

export const findWhere = async function (query) {
  return await unitRepository.findWhere(query);
};
