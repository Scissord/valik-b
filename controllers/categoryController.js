import * as Category from '#models/category.js';

export const get = async (req, res) => {
  const categories = await Category.getAll();
  res.status(200).send(categories);
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
