import * as Category from '#models/category.js';

export const get = async (req, res) => {
  const categories = await Category.getAll();
  res.status(200).send(categories);
};

export const create = async (req, res) => {
  const data = req.body;
  const category = await Category.create(data);
  res.status(200).send(category);
};

export const update = async (req, res) => {
  const data = req.body;
  const { category_id } = req.params;
  const category = await Category.update(category_id, data);
  res.status(200).send(category);
};

export const softDelete = async (req, res) => {
  const { category_id } = req.params;
  const category = await Category.softDelete(category_id);
  res.status(200).send(category);
};

export const getTree = async (req, res) => {
  const categories = await Category.getTree();
  res.status(200).send(categories);
};

export const find = async (req, res) => {
  const { limit, page } = req.query;
  const category_id = req.params.category_id;

  const { category, products, children_categories, total, totalPages } = await Category.find(
    limit,
    page,
    category_id
  );

  res.status(200).send({
    category,
    products,
    children_categories,
    total,
    totalPages
  });
};
