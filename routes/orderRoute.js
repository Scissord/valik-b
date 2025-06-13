import express from 'express';
import * as controller from '#controllers/orderController.js';
import validate from '#middleware/validate.js';
import { createOrderValidation } from '#validations/order/create.js';
import { poolingOrderValidation } from '#validations/order/pooling.js';

const router = express.Router();

router.get('', controller.get);
router.post('', validate(createOrderValidation), controller.create);
router.post('/pooling', validate(poolingOrderValidation), controller.pooling);

export default router;
