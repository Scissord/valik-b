import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const userTokenRepository = repository('user_token');

export const get = async () => {
  return await userTokenRepository.getActive();
};

export const create = async data => {
  return await userTokenRepository.create(data);
};

export const update = async (id, data) => {
  return await userTokenRepository.update(id, data);
};

export const updateWhere = async (query, data) => {
  return await userTokenRepository.updateWhere(query, data);
};

export const softDelete = async id => {
  return await userTokenRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await userTokenRepository.hardDelete(id);
};

export const find = async id => {
  return await userTokenRepository.find(id);
};

export const findWhere = async function (query) {
  return await userTokenRepository.findWhere(query);
};

export const findWhereActive = async function (query) {
  return await userTokenRepository.findWhereActive(query);
};
