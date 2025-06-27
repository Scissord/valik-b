import { body } from 'express-validator';

export const createManagerValidation = [
  body('login')
    .exists()
    .withMessage('Логин обязателен')
    .bail()
    .isString()
    .withMessage('Логин должен быть строкой')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Логин должен содержать от 3 до 50 символов'),

  body('password')
    .exists()
    .withMessage('Пароль обязателен')
    .bail()
    .isString()
    .withMessage('Пароль должен быть строкой')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать не менее 6 символов'),

  body('email')
    .exists()
    .withMessage('Email обязателен')
    .bail()
    .isEmail()
    .withMessage('Некорректный email'),

  body('full_name')
    .exists()
    .withMessage('ФИО обязательно')
    .bail()
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