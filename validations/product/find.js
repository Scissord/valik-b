import { param } from 'express-validator';

export const findValidation = [
  param('product_id').isInt({ min: 1 }).withMessage('Id категории должен быть числом от 1')
];
