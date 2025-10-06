import { body, param } from 'express-validator';

export const updateUserValidation = [
  param('user_id').isInt().withMessage('User ID must be an integer'),

  body('email').optional().isEmail().withMessage('Invalid email format'),

  body('full_name')
    .optional()
    .isString()
    .withMessage('Full name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Full name must be between 1 and 255 characters'),

  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string')
    .isLength({ max: 20 })
    .withMessage('Phone number is too long'),

  body('birth_date').optional().isISO8601().withMessage('Birth date must be a valid date'),

  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),

  body('address').optional().isString().withMessage('Address must be a string')
];
