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

export const getForDispatcher = async client_id => {
  return await db('order as o')
    .select('o.*')
    .where('o.deleted_at', null)
    .andWhere('o.client_id', client_id)
    .orderBy('o.id', 'desc');
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

export const find = async id => {
  return await categoryRepository.find(id);
};

export const findWhere = async function (query) {
  return await categoryRepository.findWhere(query);
};
