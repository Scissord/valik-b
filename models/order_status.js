import repository from './repository.js';

const orderStatusRepository = repository('order_status');

export const get = async () => {
  return await orderStatusRepository.getActive();
};

export const create = async data => {
  return await orderStatusRepository.create(data);
};

export const update = async (id, data) => {
  return await orderStatusRepository.update(id, data);
};

export const softDelete = async id => {
  return await orderStatusRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await orderStatusRepository.hardDelete(id);
};

export const find = async id => {
  return await orderStatusRepository.find(id);
};

export const findWhere = async function (query) {
  return await orderStatusRepository.findWhere(query);
};
