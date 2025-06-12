import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const userRepository = repository('user');

export const get = async () => {
  return await userRepository.getActive();
};

export const create = async data => {
  return await userRepository.create(data);
};

export const update = async (id, data) => {
  return await userRepository.update(id, data);
};

export const softDelete = async id => {
  return await userRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await userRepository.hardDelete(id);
};

export const find = async id => {
  return await userRepository.find(id);
};

export const findWhere = async function (query) {
  return await userRepository.findWhere(query);
};

export const findWhereActive = async function (query) {
  return await userRepository.findWhereActive(query);
};
