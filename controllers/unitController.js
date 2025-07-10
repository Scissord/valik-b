import * as Unit from '#models/unit.js';

export const get = async (req, res) => {
  const units = await Unit.get();
  res.status(200).send(units);
};

export const create = async (req, res) => {
  const data = req.body;
  const unit = await Unit.create(data);

  res.status(200).send(unit); 
};

export const update = async (req, res) => {
  const { unit_id } = req.params;
  const data = req.body;

  const unit = await Unit.update(unit_id, data);

  res.status(200).send(unit); 
};

export const softDelete = async (req, res) => {
  const { unit_id } = req.params;
  const unit = await Unit.softDelete(unit_id);

  res.status(200).send(unit); 
};