import repository from './repository.js';

const fileRepository = repository('file');

export const create = async data => {
  return await fileRepository.create(data);
};

export const find = async id => {
  return await fileRepository.find(id);
};

export const findWhere = async query => {
  return await fileRepository.findWhere(query);
};

export const update = async (id, data) => {
  return await fileRepository.update(id, data);
};

export const softDelete = async id => {
  return await fileRepository.softDelete(id);
};
