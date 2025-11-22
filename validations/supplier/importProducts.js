import { body } from 'express-validator';

export const importProductsValidation = [
  body('unit_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('unit_id должен быть положительным числом')
];
