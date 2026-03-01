import express from 'express';
import * as controller from '#controllers/paymentMethodController.js';

const router = express.Router();

// получить список оплаты может любой пользователь
/**
 * @swagger
 * /payment_methods:
 *   get:
 *     tags: [PaymentMethods]
 *     summary: Get payment methods
 *     responses:
 *       200:
 *         description: OK
 */
router.get('', controller.get);

export default router;
