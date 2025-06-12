import express from 'express';
import * as controller from '#controllers/supplierController.js';
import verify from '#middleware/verify.js';
import validate from '#middleware/validate.js';
import {
  loginValidation,
  registrationValidation
} from '#validations/supplier/index.js';

const router = express.Router();

// work with supplier authorization
router.post('/login',
  validate(loginValidation),
  controller.supplierLogin
);
router.post('/logout',
  verify('supplier'),
  controller.supplierLogout
);
router.post('/refresh',
  verify('supplier'),
  controller.supplierRefresh
);
router.post('/registration',
  validate(registrationValidation),
  controller.supplierRegistration
);

// for with supplier products
router.post('/products', verify('supplier'), controller.createProduct);
router.get('/products', verify('supplier'), controller.getProducts);
router.patch('/products/:id', verify('supplier'), controller.updateProduct);
router.delete('/products/:id', verify('supplier'), controller.deleteProduct);

export default router;
