import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const brandRepository = repository('brand');

export const get = async () => {
  return await brandRepository.getActive();
};

export const getForSearch = async () => {
  return await db('brand as b')
    .select('b.id', 'b.title')
};

export const create = async data => {
  return await brandRepository.create(data);
};

export const update = async (id, data) => {
  return await brandRepository.update(id, data);
};

export const softDelete = async id => {
  return await brandRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await brandRepository.hardDelete(id);
};

export const find = async id => {
  return await brandRepository.find(id);
};

export const findWhere = async function (query) {
  return await brandRepository.findWhere(query);
};
