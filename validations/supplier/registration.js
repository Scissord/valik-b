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
      const user = await db('supplier as s')
        .select('s.*')
        .where('s.login', value)
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
];
