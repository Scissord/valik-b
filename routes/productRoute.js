import express from 'express';
import * as controller from '#controllers/productController.js';
import { getValidation, findValidation } from '#validations/product/index.js';
import validate from '#middleware/validate.js';

const router = express.Router();

// нет verify на user, так как все могут видеть продукты
router.get('/', controller.getAll);
router.get('/main', validate(getValidation), controller.getForMainPage);

// нет verify на user, так как все могут видеть инфу о продукте
router.get('/:product_id', validate(findValidation), controller.find);

export default router;
