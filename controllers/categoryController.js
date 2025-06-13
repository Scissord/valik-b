import * as Category from '#models/category.js';

export const get = async (req, res) => {
  try {
    const categories = await Category.get();
    res.status(200).send(categories);
  } catch (error) {
    console.error('Ошибка при получении списка категорий:', error);
    res.status(500).json({ error: 'Ошибка при получении списка категорий!' });
  }
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
