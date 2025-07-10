import { param } from 'express-validator';

export const deleteUnitValidation = [
  param('unit_id')
    .exists()
    .withMessage('unit_id обязателен')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('unit_id должен быть положительным числом'),
];
