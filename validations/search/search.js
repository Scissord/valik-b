import { query } from 'express-validator';

export const searchValidation = [
  query('q')
    .isString()
    .withMessage('Поле q должно быть строкой')
    .trim()
    .notEmpty()
    .withMessage('Поле q не должно быть пустым')
];
