import express from 'express';
import * as controller from '#controllers/productController.js';
import { getValidation, findValidation } from '#validations/product/index.js';
import validate from '#middleware/validate.js';

const router = express.Router();

router.get('/main', validate(getValidation), controller.getForMainPage);
router.get('/:product_id', validate(findValidation), controller.find);

export default router;
