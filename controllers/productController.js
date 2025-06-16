import * as Product from '#models/product.js';
import * as Brand from '#models/brand.js';
import * as Category from '#models/category.js';
import * as Unit from '#models/unit.js';

export const getForMainPage = async (req, res) => {
  const { limit, page } = req.query;

  const { category, children_categories, products, total, totalPages } =
    await Product.getForMainPage(limit, page);

  res.status(200).send({
    category,
    children_categories,
    products,
    total,
    totalPages
  });
};

export const find = async (req, res) => {
  const id = req.params.product_id;
  const product = await Product.find(id);

  res.status(200).send(product);
};
