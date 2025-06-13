import { query } from 'express-validator';

export const getValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть числом от 1 до 100'),

  query('page').optional().isInt({ min: 1 }).withMessage('Номер страницы должен быть числом от 1')
];
