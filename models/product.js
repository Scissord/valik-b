import knex from './knex.js';
import repository from './repository.js';

const db = knex();
const productRepository = repository('product');

export const getForMainPage = async (limit = 9, page = 1) => {
  const result = await db('product as p')
    .select(
      'p.*',
      db.raw(`
        COALESCE(
          (
            SELECT json_agg(f.link)
            FROM product_image pi
            JOIN file f ON f.id = pi.file_id
            WHERE pi.product_id = p.id AND pi.deleted_at IS NULL
          ), '[]'
        ) as images
      `)
    )
    .whereNull('p.deleted_at')
    .orderBy('p.id', 'asc')
    .paginate({
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

export const getForSupplier = async (limit = 9, page = 1, supplier_id) => {
  const result = await db('product as p')
    .select(
      'p.*',
      db.raw(`
        COALESCE(
          (
            SELECT json_agg(f.link)
            FROM product_image pi
            JOIN file f ON f.id = pi.file_id
            WHERE pi.product_id = p.id AND pi.deleted_at IS NULL
          ), '[]'
        ) as images
      `)
    )
    .whereNull('p.deleted_at')
    .where('p.supplier_id', supplier_id)
    .orderBy('p.id', 'asc')
    .paginate({
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

export const getForSearch = async () => {
  return await db('product as p').select('p.id', 'p.title');
};

export const get = async () => {
  return await productRepository.getActive();
};

export const getWhere = async query => {
  return await productRepository.getWhere(query);
};

// Поиск товаров по ключевым словам (частичное совпадение по title)
export const searchByKeywords = async (keywords = [], limit = 60) => {
  const q = (Array.isArray(keywords) ? keywords : String(keywords).split(/[\s,]+/))
    .map(s => s.trim())
    .filter(Boolean);

  if (q.length === 0) {
    return await db('product as p')
      .select('p.id', 'p.title', 'p.price')
      .whereNull('p.deleted_at')
      .orderBy('p.id', 'asc')
      .limit(limit);
  }

  return await db('product as p')
    .select('p.id', 'p.title', 'p.price')
    .whereNull('p.deleted_at')
    .andWhere(builder => {
      q.forEach(term => {
        builder.orWhere('p.title', 'ilike', `%${term}%`);
      });
    })
    .orderBy('p.id', 'asc')
    .limit(limit);
};

export const create = async data => {
  return await productRepository.create(data);
};

export const createMany = async data => {
  return await productRepository.createMany(data);
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
  return await db('product as p')
    .select(
      'p.*',
      db.raw(`
        COALESCE(
          (
            SELECT json_agg(f.link)
            FROM product_image pi
            JOIN file f ON f.id = pi.file_id
            WHERE pi.product_id = p.id AND pi.deleted_at IS NULL
          ), '[]'
        ) as images
      `),
      'b.title as brand',
      'c.title as category',
      'u.title as unit'
    )
    .leftJoin('brand as b', 'b.id', 'p.brand_id')
    .leftJoin('category as c', 'c.id', 'p.category_id')
    .leftJoin('unit as u', 'u.id', 'p.unit_id')
    .where('p.id', id)
    .first();
};

export const findWhere = async function (query) {
  return await productRepository.findWhere(query);
};
