import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import * as Unit from '#models/unit.js';
import formatDate from '#utils/formatDate.js';

export const create = async (req, res) => {
  const { cart, phone, name } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    res.status(400).send({ message: 'Пожалуйста выберите продукты!' });
    return;
  }

  // проверки на телефон
  // проверки на имя

  let total = 0;
  const order = await Order.create({
    name,
    phone
  });

  for (const item of cart) {
    const product = await Product.find(item.id);
    const item_total = +item.quantity * +product.price;

    const i = await OrderItem.create({
      order_id: order.id,
      product_id: item.id,
      total: item_total,
      quantity: item.quantity
    });

    total += +item_total;
  }

  await Order.update(order.id, { total });

  res.status(200).send(order);
};

export const find = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    res.status(400).send({ message: 'Укажите номер заказа!' });
    return;
  }

  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Regex.test(order_id)) {
    res.status(400).send({ message: 'Неверный формат UUID!' });
    return;
  }

  const order = await Order.find(order_id);

  if (!order) {
    res.status(400).send({ message: 'Информация о заказе отсутствует!' });
    return;
  }

  order.created_at = formatDate(+order.created_at);
  order.updated_at = formatDate(+order.updated_at);

  const items = await OrderItem.getByOrderId(order_id);

  if (!items) {
    res.status(400).send({ message: 'У заказа отсутствует позиции!' });
    return;
  }

  for (const item of items) {
    const product = await Product.find(item.product_id);
    const unit = await Unit.find(product.unit_id);
    item.product = product;
    item.unit = unit;
    item.name = product.title;
    item.created_at = formatDate(+item.created_at);
    item.updated_at = formatDate(+item.updated_at);
  }

  order.items = items;

  res.status(200).send(order);
};
