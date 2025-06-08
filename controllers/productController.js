import * as Product from '#models/product.js';
import * as Brand from '#models/brand.js';
import * as Category from '#models/category.js';
import * as Unit from '#models/unit.js';

export const getForSuppliers = async (req, res) => {
  try {
    const products = await Product.get();
    res.status(200).send({ message: 'ok', cities });
  } catch (err) {
    console.log('Error in get city controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const createForSuppliers = async (req, res) => {
  try {
    const data = req.body;
    const city = await Product.create(data);

    return res.status(200).send({ message: 'ok', city });
  } catch (err) {
    console.log('Error in create city controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const updateForSuppliers = async (req, res) => {
  try {
    const { city_id } = req.params;
    const data = req.body;
    const city = await Product.update(city_id, data);

    res.status(200).send({ message: 'ok', city });
  } catch (err) {
    console.log('Error in update city controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const softDeleteForSuppliers = async (req, res) => {
  try {
    const { city_id } = req.params;
    const city = await Product.softDelete(city_id);

    res.status(200).send({ message: 'ok', city });
  } catch (err) {
    console.log('Error in softDelete product controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

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
