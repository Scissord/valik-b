import { validationResult } from 'express-validator';

const validate = validations => {
  return async (req, res, next) => {
    // Выполняем все проверки
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    next();
  };
};

export default validate;
