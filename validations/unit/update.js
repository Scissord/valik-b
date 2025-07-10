import { body, param } from 'express-validator';

export const updateUnitValidation = [
  body('title')
    .exists({ checkFalsy: true })
    .withMessage('Название обязательно')
    .bail()
    .isString()
    .withMessage('Название должно быть строкой')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Название должно содержать от 3 до 50 символов'),

  param('unit_id')
    .exists()
    .withMessage('unit_id обязателен')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('unit_id должен быть положительным числом'),
];
