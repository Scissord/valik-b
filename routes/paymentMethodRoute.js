import express from 'express';
import * as controller from '#controllers/paymentMethodController.js';

const router = express.Router();

// получить список оплаты может любой пользователь
router.get('', controller.get);

export default router;
