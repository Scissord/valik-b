import { param } from 'express-validator';

export const deleteBrandValidation = [
  param('brand_id')
    .exists()
    .withMessage('brand_id обязателен')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('brand_id должен быть положительным числом'),
];
