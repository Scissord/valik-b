import * as PaymentMethod from '#models/payment_method.js';

export const get = async (req, res) => {
  const payment_methods = await PaymentMethod.get();
  res.status(200).send(payment_methods);
};
