import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import formatDate from '#utils/formatDate.js';
import { sendOrderNotification as sendClientNotification } from '#utils/telegramNotifier.js';
import { sendOrderNotification as sendManagerNotification } from '#utils/telegramManagerBot.js';

export const get = async (req, res) => {
  const user = req.user;

  const orders = await Order.getWhere({ user_id: user.id });

  if (!orders) {
    res.status(400).send({ message: 'Информация о заказах отсутствует!' });
    return;
  }

  for (const order of orders) {
    order.created_at = formatDate(+order.created_at);
    order.updated_at = formatDate(+order.updated_at);

    const items = await OrderItem.getByOrderId(order.id);

    for (const item of items) {
      const product = await Product.find(item.product_id);
      item.product = product;
      item.created_at = formatDate(+item.created_at);
      item.updated_at = formatDate(+item.updated_at);
    }

    order.items = items;
  }

  res.status(200).send(orders);
};

export const create = async (req, res) => {
  const user = req.user;
  const { cart } = req.body;

  let total = 0;
  const order = await Order.create({
    user_id: user.id
  });

  // Массив для хранения информации о товарах для уведомления
  const orderItems = [];

  for (const item of cart) {
    const product = await Product.find(item.id);
    const item_total = +item.quantity * +product.price;

    await OrderItem.create({
      order_id: order.id,
      product_id: item.id,
      total: item_total,
      quantity: item.quantity
    });

    // Добавляем информацию о товаре для уведомления
    orderItems.push({
      name: product.title || product.name,
      quantity: item.quantity,
      total: item_total
    });

    total += +item_total;
  }

  await Order.update(order.id, { total });

  // Отправляем уведомление в Telegram
  try {
    const updatedOrder = await Order.find(order.id);
    // Отправляем уведомление клиенту
    await sendClientNotification(updatedOrder, orderItems);
    // Отправляем уведомление менеджеру
    await sendManagerNotification(updatedOrder, orderItems);
  } catch (error) {
    // Продолжаем выполнение, даже если отправка уведомления не удалась
  }

  res.status(200).send(order);
};

export const pooling = async (req, res) => {
  const user = req.user;
  const order_id = req.body.order_id;

  const order = await Order.find(order_id);

  if (!order) {
    res.status(400).send({ message: 'Информация о заказе отсутствует!' });
    return;
  }

  if (order.user_id != user.id) {
    res.status(400).send({ message: 'Данный заказ оформлен на другого человека!' });
    return;
  }

  const order_statuses = {
    0: 'Заказ создан!',
    1: 'Заказ в сборке!',
    2: 'Заказ готов и отправлен!',
    3: 'Заказ доставлен!',
    4: 'Отмена заказа!'
  };

  const status = order_statuses[order.status];

  res.status(200).send(status);
};
