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
