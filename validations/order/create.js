import { body } from 'express-validator';

export const createOrderValidation = [
  body('cart').isArray({ min: 1 }).withMessage('Корзина пустая!'),

  body('cart.*.id')
    .exists()
    .withMessage('item.id обязателен!')
    .bail()
    .isInt({ min: 1 })
    .withMessage('item.id должен быть числом больше 0'),

  body('cart.*.quantity')
    .exists()
    .withMessage('item.quantity обязателен!')
    .bail()
    .isInt({ min: 1 })
    .withMessage('item.quantity должен быть числом больше 0')
];
