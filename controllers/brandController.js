import * as Brand from '#models/brand.js';

export const get = async (req, res) => {
  const brands = await Brand.get();
  res.status(200).send(brands);
};

export const create = async (req, res) => {
  const data = req.body;
  const brand = await Brand.create(data);

  res.status(200).send(brand); 
};

export const update = async (req, res) => {
  const { brand_id } = req.params;
  const data = req.body;

  const brand = await Brand.update(brand_id, data);

  res.status(200).send(brand); 
};

export const softDelete = async (req, res) => {
  const { brand_id } = req.params;
  const brand = await Brand.softDelete(brand_id);

  res.status(200).send(brand); 
};