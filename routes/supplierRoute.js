import express from 'express';
import * as controller from '#controllers/supplierController.js';
import verifySupplier from '#middleware/verifySupplier.js';

const router = express.Router();

// work with supplier authorization
router.post('/login', controller.supplierLogin);
router.post('/logout', verifySupplier, controller.supplierLogout);
router.post('/refresh', verifySupplier, controller.supplierRefresh);

// for with supplier products
router.post('/products', verifySupplier, controller.createProduct);
router.get('/products', verifySupplier, controller.getProducts);
router.patch('/products/:id', verifySupplier, controller.updateProduct);
router.delete('/products/:id', verifySupplier, controller.deleteProduct);

export default router;
