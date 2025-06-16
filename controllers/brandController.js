import * as Brand from '#models/brand.js';

export const get = async (req, res) => {
  const brands = await Brand.get();
  res.status(200).send(brands);
};
