import repository from './repository.js';

const productImageRepository = repository('product_image');

export const get = async () => {
  return await productImageRepository.getActive();
};

export const create = async data => {
  return await productImageRepository.create(data);
};

export const update = async (id, data) => {
  return await productImageRepository.update(id, data);
};

export const softDelete = async id => {
  return await productImageRepository.softDelete(id);
};

export const softDeleteWhere = async query => {
  return await productImageRepository.softDelete(query);
};

export const hardDelete = async id => {
  return await productImageRepository.hardDelete(id);
};

export const find = async id => {
  return await productImageRepository.find(id);
};

export const findWhere = async function (query) {
  return await productImageRepository.findWhere(query);
};
