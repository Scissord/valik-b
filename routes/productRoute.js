import express from 'express';
import * as controller from '#controllers/productController.js';
import verifySupplier from '#middleware/verifySupplier.js';

const router = express.Router();

router.get('/suppliers', verifySupplier, controller.getForSuppliers);
router.post('/suppliers', verifySupplier, controller.createForSuppliers);
router.patch('/suppliers/:supplier_id', verifySupplier, controller.updateForSuppliers);
router.delete('/suppliers/:supplier_id', verifySupplier, controller.softDeleteForSuppliers);

router.get('/main', controller.getForMainPage);
router.get('/categories/:category_id', controller.getForCategory);
router.get('/:product_id', controller.find);

export default router;
