import express from 'express';
import * as controller from '#controllers/authController.js';
import verifySupplier from '#middleware/verifySupplier.js';

const router = express.Router();

router.post('/suppliers/login', verifySupplier, controller.supplierLogin);
router.post('/suppliers/logout', verifySupplier, controller.supplierLogout);
router.post('/suppliers/refresh', verifySupplier, controller.supplierRefresh);

export default router;
