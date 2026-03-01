import express from 'express';
import * as controller from '#controllers/productController.js';
import { getValidation, findValidation } from '#validations/product/index.js';
import validate from '#middleware/validate.js';

const router = express.Router();

// нет verify на user, так как все могут видеть продукты
/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', controller.getAll);
/**
 * @swagger
 * /products/main:
 *   get:
 *     tags: [Products]
 *     summary: Get products for main page
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/main', validate(getValidation), controller.getForMainPage);

// нет verify на user, так как все могут видеть инфу о продукте
/**
 * @swagger
 * /products/{product_id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:product_id', validate(findValidation), controller.find);

export default router;
