import express from 'express';
import * as controller from '#controllers/productController.js';

const router = express.Router();

router.get('/main', controller.getForMainPage);
router.get('/:product_id', controller.find);

export default router;
