import { body } from 'express-validator';

export const poolingOrderValidation = [
  body('order_id').isInt({ min: 1 }).withMessage('order_id должен быть числом от 1')
];
