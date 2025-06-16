import express from 'express';
import * as controller from '#controllers/orderController.js';
import validate from '#middleware/validate.js';
import { createOrderValidation } from '#validations/order/create.js';
import { poolingOrderValidation } from '#validations/order/pooling.js';
import verify from '#middleware/verify.js';

const router = express.Router();

router.get('', verify('user'), controller.get);
router.post('', validate(createOrderValidation), verify('user'), controller.create);
router.post('/pooling', validate(poolingOrderValidation), verify('user'), controller.pooling);

export default router;
