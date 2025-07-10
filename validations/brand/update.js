import { body, param } from 'express-validator';

export const updateBrandValidation = [
  body('title')
    .exists({ checkFalsy: true })
    .withMessage('Название обязательно')
    .bail()
    .isString()
    .withMessage('Название должно быть строкой')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Название должно содержать от 3 до 50 символов'),

  param('brand_id')
    .exists()
    .withMessage('brand_id обязателен')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('brand_id должен быть положительным числом'),
];
