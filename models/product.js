import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const productRepository = repository('product');

export const getForMainPage = async (limit = 9, page = 1) => {
  const result = await db('product as p').orderBy('id', 'asc').paginate({
    perPage: limit,
    currentPage: page,
    isLengthAware: true
  });

  const { total, lastPage } = result.pagination;

  return {
    products: result.data,
    total,
    totalPages: lastPage
  };
};

export const getForCategory = async (limit = 9, page = 1, category_id) => {
  const category = await db('category as c').where('c.id', category_id).first();

  const children_categories = await db('category as c')
    .where('c.parent_id', category_id)
    .orderBy('id', 'asc');

  const result = await db('product as p')
    .orderBy('id', 'asc')
    .where('p.category_id', category_id)
    .paginate({
      perPage: limit,
      currentPage: page,
      isLengthAware: true
    });

  const { total, lastPage } = result.pagination;

  return {
    category,
    children_categories,
    products: result.data,
    total,
    totalPages: lastPage
  };
};

export const get = async () => {
  return await productRepository.getActive();
};

export const create = async data => {
  return await productRepository.create(data);
};

export const update = async (id, data) => {
  return await productRepository.update(id, data);
};

export const softDelete = async id => {
  return await productRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await productRepository.hardDelete(id);
};

export const find = async id => {
  return await productRepository.find(id);
};

export const findWhere = async function (query) {
  return await productRepository.findWhere(query);
};
