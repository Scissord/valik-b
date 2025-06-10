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

export const getForCategory = async (req, res) => {
  const { limit, page } = req.query;
  const category_id = req.params.category_id;

  const { category, products, children_categories, total, totalPages } =
    await Product.getForCategory(limit, page, category_id);

  res.status(200).send({
    category,
    products,
    children_categories,
    total,
    totalPages
  });
};

export const find = async (req, res) => {
  const id = req.params.product_id;

  const product = await Product.find(id);
  const brands = await Brand.get();
  const categories = await Category.getAll();
  const units = await Unit.get();

  product.brand = brands.find(brand => brand.id == product.brand_id)?.title;
  product.unit = units.find(unit => unit.id == product.unit_id)?.title;
  product.category = categories.find(category => category.id == product.category_id)?.title;

  res.status(200).send(product);
};
