import { body } from 'express-validator';

export const createBrandValidation = [
  body('title')
    .exists()
    .withMessage('Название обязательно')
    .isString()
    .withMessage('Название должно быть строкой')
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage('Название должно содержать от 3 до 50 символов'),
]; 
