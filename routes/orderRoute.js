import express from 'express';
import * as controller from '#controllers/orderController.js';

const router = express.Router();

router.post('', controller.create);
// should i rename this in pooling?
router.post('/find', controller.find);
export default router;
