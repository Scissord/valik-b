import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';

export async function createOrder(items) {
  const order = await Order.create({
    total: items.reduce((acc, item) => acc + +item.total, 0)
  });

  for (const item of items) {
    await OrderItem.create({
      order_id: order.id,
      product_id: item.id,
      quantity: item?.quantity || 0,
      price: item.price,
      total: item.total
    });
  }

  return order;
}

export async function updateOrder(request) {
  for (const item of request.order.items) {
    if (!item.id) {
      await OrderItem.create({
        order_id: request.order_id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      });
    } else {
      await OrderItem.update(item.id, {
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      });
    }
  }

  return request.order;
}
