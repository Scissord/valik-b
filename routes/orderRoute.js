import express from 'express';
import * as controller from '#controllers/orderController.js';
import validate from '#middleware/validate.js';
import { createOrderValidation } from '#validations/order/create.js';
import { poolingOrderValidation } from '#validations/order/pooling.js';
import verify from '#middleware/verify.js';

const router = express.Router();

// свои заказы может получить только авторизованный пользователь
/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('', verify('user'), controller.get);

// создать заказ может только авторизованный пользователь
/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('', validate(createOrderValidation), verify('user'), controller.create);

// получить информацию о заказе может только авторизованный пользователь
/**
 * @swagger
 * /orders/pooling:
 *   post:
 *     tags: [Orders]
 *     summary: Get order info by pooling
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/pooling', validate(poolingOrderValidation), verify('user'), controller.pooling);

export default router;
