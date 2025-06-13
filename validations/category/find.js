import { query, param } from 'express-validator';

export const findValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть числом от 1 до 100'),

  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть числом от 1'),

  param('category_id').isInt({ min: 1 }).withMessage('Id категории должен быть числом от 1')
];
