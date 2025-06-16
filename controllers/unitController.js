import * as Unit from '#models/unit.js';

export const get = async (req, res) => {
  const units = await Unit.get();
  res.status(200).send(units);
};
