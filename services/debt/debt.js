import * as Debt from '#models/debt.js';
import * as DebtItem from '#models/debt_item.js';

export async function createDebt(items) {
  const debt = await Debt.create({
    total: items.reduce((acc, item) => acc + +item.total, 0)
  });

  for (const item of items) {
    const pallet_quantity = item.pallet_quantity ? item.pallet_quantity : 0;
    const piece_quantity = item.piece_quantity ? item.piece_quantity : 0;

    await DebtItem.create({
      debt_id: debt.id,
      product_id: item.id,
      price: item.price,
      total: item.total,
      debt_pallet_quantity: item?.debt_pallet_quantity || 0,
      debt_piece_quantity: item?.debt_piece_quantity || 0,
      previous_quantity: item?.previous_quantity || 0,
      pallet_quantity,
      piece_quantity
    });
  }

  return debt;
}

export async function updateDebt(request) {
  for (const item of request.debt.items) {
    if (!item.id) {
      await DebtItem.create({
        debt_id: request.debt.id,
        product_id: item.product.id,
        pallet_quantity: item.pallet_quantity,
        piece_quantity: item.piece_quantity,
        debt_pallet_quantity: item.debt_pallet_quantity,
        debt_piece_quantity: item.debt_piece_quantity,
        previous_quantity: item.previous_quantity,
        price: item.price,
        total: item.total
      });
    } else {
      await DebtItem.update(item.id, {
        product_id: item.product.id,
        pallet_quantity: item.pallet_quantity,
        piece_quantity: item.piece_quantity,
        debt_pallet_quantity: item.debt_pallet_quantity,
        debt_piece_quantity: item.debt_piece_quantity,
        previous_quantity: item.previous_quantity,
        price: item.price,
        total: item.total
      });
    }
  }

  return request.debt;
}
