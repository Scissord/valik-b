import { body } from 'express-validator';

const loginValidation = [
  body('name')
    .isString()
    .withMessage('Имя должно быть строкой')
    .trim()
    .notEmpty()
    .withMessage('Имя не должно быть пустым')
    .custom(value => {
      return value.replace(/\s+/g, '');
    })
    .withMessage('Имя не должно содержать пробелы')
  // body('email')
  //   .isEmail()
  //   .withMessage('Некорректный email')
  //   .custom(async value => {
  //     const user = await prisma.user.findUnique({ where: { email: value } });
  //     if (user) {
  //       throw new Error('Email уже используется');
  //     }
  //     return true;
  //   })
  // body('age').optional().isInt({ min: 0 }).withMessage('Возраст должен быть числом не меньше 0')
];

export default loginValidation;
