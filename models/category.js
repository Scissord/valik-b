import knex from './knex.js';
import repository from './repository.js';
import { buildTree } from '#utils/buildTree.js';
import { getAllCategoryIds } from '#utils/getAllCategoryIds.js';

const db = knex();
const categoryRepository = repository('category');

export const get = async () => {
  const all_categories = await db('category as c').select('*').orderBy('id', 'asc');

  const categories = buildTree(all_categories, null);

  const addProductCounts = async category => {
    const categoryIds = getAllCategoryIds(category);

    const [{ count }] = await db('product')
      .whereIn('category_id', categoryIds)
      .count('id as count');

    return {
      ...category,
      totalProductCount: parseInt(count, 10),
      children: await Promise.all(category.children.map(addProductCounts))
    };
  };

  const enriched = await Promise.all(categories.map(addProductCounts));
  return enriched;
};

export const find = async (limit = 9, page = 1, category_id = null) => {
  const category = await db('category as c').where('c.id', category_id).first();

  const children_categories = await db('category as c')
    .where('c.parent_id', category_id)
    .orderBy('id', 'asc');

  const result = await db('product as p')
    .orderBy('id', 'asc')
    .where('p.category_id', category_id)
    .whereNull('p.deleted_at')
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

export const getForDispatcher = async client_id => {
  return await db('order as o')
    .select('o.*')
    .where('o.deleted_at', null)
    .andWhere('o.client_id', client_id)
    .orderBy('o.id', 'desc');
};

export const getForSearch = async () => {
  return await db('category as c').select('c.id', 'c.title');
};

export const getAll = async () => {
  return await categoryRepository.getActive();
};

export const create = async data => {
  return await categoryRepository.create(data);
};

export const update = async (id, data) => {
  return await categoryRepository.update(id, data);
};

export const softDelete = async id => {
  return await categoryRepository.softDelete(id);
};

export const hardDelete = async id => {
  return await categoryRepository.hardDelete(id);
};

export const findWhere = async function (query) {
  return await categoryRepository.findWhere(query);
};
