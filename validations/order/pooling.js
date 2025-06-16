import { body } from 'express-validator';

export const poolingOrderValidation = [
  body('order_id').isUUID().withMessage('order_id должен быть UUID')
];
