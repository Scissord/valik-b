import knex from '#models/knex.js';
import { body } from 'express-validator';

const db = knex();

export const registrationValidation = [
  body('login')
    .isString()
    .withMessage('Логин должен быть строкой')
    .trim()
    .notEmpty()
    .withMessage('Логин не должен быть пустым')
    .isLength({ min: 4 })
    .withMessage('Логин должен содержать минимум 4 символа')
    .custom(value => {
      return value.replace(/\s+/g, '');
    })
    .withMessage('Логин не должен содержать пробелы')
    .custom(async (value) => {
      const user = await db('user as u')
        .select('u.*')
        .where('u.login', value)
        .first();

      if (user) {
        throw new Error('Логин уже используется');
      }
      return true;
    }),

  body('password')
    .isString()
    .withMessage('Пароль должен быть строкой')
    .trim()
    .notEmpty()
    .withMessage('Пароль не должен быть пустым')
    .isLength({ min: 8 })
    .withMessage('Пароль должен содержать минимум 8 символов')
    .custom(value => {
      return value.replace(/\s+/g, '');
    })
    .withMessage('Пароль не должен содержать пробелы'),

  body('email')
    .isEmail()
    .withMessage('Некорректный email')
    .custom(async (value) => {
      const user = await db('user as u')
        .select('u.*')
        .where('u.email', value)
        .first();

      if (user) {
        throw new Error('Email уже используется');
      }
      return true;
    }),

  body('full_name')
    .isString()
    .withMessage('ФИО должно быть строкой')
    .trim()
    .notEmpty()
    .withMessage('ФИО не должно быть пустым'),

  body('phone')
    .optional()
    .matches(/^[78]\d{10}$/)
    .withMessage('Номер телефона должен состоять из 11 цифр и начинаться с 7 или 8')
    .custom(async (value) => {
      const user = await db('user as u')
        .select('u.*')
        .where('u.phone', value)
        .first();

      if (user) {
        throw new Error('Телефон уже используется');
      }
      return true;
    }),

  body('birth_date')
    .optional()
    .isInt()
    .withMessage('Дата рождения должна быть числом'),

  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Некорректное значение пола'),

  body('address')
    .optional()
    .isString()
    .withMessage('Адрес должен быть строкой')
];
