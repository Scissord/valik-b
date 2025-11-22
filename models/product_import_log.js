import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const productImportLogRepository = repository('product_import_log');

export const create = async data => {
  return await productImportLogRepository.create(data);
};

export const update = async (id, data) => {
  return await productImportLogRepository.update(id, data);
};

export const find = async id => {
  return await productImportLogRepository.find(id);
};

export const findWhere = async query => {
  return await productImportLogRepository.findWhere(query);
};

export const getForSupplier = async supplier_id => {
  return await db('product_import_log as pil')
    .select('*')
    .where('pil.supplier_id', supplier_id)
    .whereNull('pil.deleted_at')
    .orderBy('pil.id', 'desc');
};
