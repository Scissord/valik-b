import { body } from 'express-validator';

export const updateManagerValidation = [
  body('login')
    .optional()
    .isString()
    .withMessage('Логин должен быть строкой')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Логин должен содержать от 3 до 50 символов'),

  body('password')
    .optional()
    .isString()
    .withMessage('Пароль должен быть строкой')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать не менее 6 символов'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Некорректный email'),

  body('full_name')
    .optional()
    .isString()
    .withMessage('ФИО должно быть строкой')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('ФИО должно содержать от 3 до 100 символов'),

  body('phone')
    .optional()
    .isString()
    .withMessage('Номер телефона должен быть строкой')
]; 