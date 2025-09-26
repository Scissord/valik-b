import express from 'express';
import * as controller from '#controllers/supplierController.js';
import verify from '#middleware/verify.js';
import validate from '#middleware/validate.js';
import { loginValidation, registrationValidation } from '#validations/supplier/index.js';
import multer from 'multer';
import getMulterStorage from '#utils/getMulterStorage.js';

const upload = multer({
  storage: getMulterStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const router = express.Router();

// work with supplier authorization
router.post('/login', validate(loginValidation), controller.supplierLogin);
router.post('/registration', validate(registrationValidation), controller.supplierRegistration);
router.post('/logout', verify('supplier'), controller.supplierLogout);
router.post('/refresh', verify('supplier'), controller.supplierRefresh);

// for with supplier products
router.post('/products', verify('supplier'), upload.array('files', 10), controller.createProduct);
router.get('/products', verify('supplier'), controller.getProducts);
router.post('/products/photos/add/:id', verify('supplier'), upload.array('files', 10), controller.createPhoto);
router.post('/products/photos/delete/:id', verify('supplier'), controller.deletePhoto);
router.get('/products/:id', verify('supplier'), controller.findProduct);
router.patch('/products/:id', verify('supplier'), controller.updateProduct);
router.delete('/products/:id', verify('supplier'), controller.deleteProduct);

// supplier order items
router.get('/order-items', verify('supplier'), controller.getOwnOrderItems);
router.patch('/order-items/:id/status', verify('supplier'), controller.updateOwnOrderItemStatus);

export default router;
