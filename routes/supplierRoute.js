import express from 'express';
import * as controller from '#controllers/supplierController.js';
import verify from '#middleware/verify.js';
import validate from '#middleware/validate.js';
import {
  loginValidation,
  registrationValidation,
  importProductsValidation
} from '#validations/supplier/index.js';
import multer from 'multer';
import getMulterStorage from '#utils/getMulterStorage.js';

const upload = multer({
  storage: getMulterStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

const router = express.Router();

// work with supplier authorization
/**
 * @swagger
 * /supplier/login:
 *   post:
 *     tags: [Suppliers]
 *     summary: Supplier login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/login', validate(loginValidation), controller.supplierLogin);
/**
 * @swagger
 * /supplier/registration:
 *   post:
 *     tags: [Suppliers]
 *     summary: Supplier registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/registration', validate(registrationValidation), controller.supplierRegistration);
/**
 * @swagger
 * /supplier/logout:
 *   post:
 *     tags: [Suppliers]
 *     summary: Supplier logout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/logout', verify('supplier'), controller.supplierLogout);
/**
 * @swagger
 * /supplier/refresh:
 *   post:
 *     tags: [Suppliers]
 *     summary: Refresh supplier token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/refresh', verify('supplier'), controller.supplierRefresh);

// for with supplier products
/**
 * @swagger
 * /supplier/products/import:
 *   post:
 *     tags: [Suppliers]
 *     summary: Import supplier products from CSV
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  '/products/import',
  verify('supplier'),
  uploadCsv.single('file'),
  validate(importProductsValidation),
  controller.importProducts
);
/**
 * @swagger
 * /supplier/products:
 *   post:
 *     tags: [Suppliers]
 *     summary: Create supplier product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/products', verify('supplier'), upload.array('files', 10), controller.createProduct);
/**
 * @swagger
 * /supplier/products:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get supplier products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/products', verify('supplier'), controller.getProducts);
/**
 * @swagger
 * /supplier/products/photos/add/{id}:
 *   post:
 *     tags: [Suppliers]
 *     summary: Add product photos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/products/photos/add/:id', verify('supplier'), upload.array('files', 10), controller.createPhoto);
/**
 * @swagger
 * /supplier/products/photos/delete/{id}:
 *   post:
 *     tags: [Suppliers]
 *     summary: Delete product photo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/products/photos/delete/:id', verify('supplier'), controller.deletePhoto);
/**
 * @swagger
 * /supplier/products/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get supplier product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/products/:id', verify('supplier'), controller.findProduct);
/**
 * @swagger
 * /supplier/products/{id}:
 *   patch:
 *     tags: [Suppliers]
 *     summary: Update supplier product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/products/:id', verify('supplier'), controller.updateProduct);
/**
 * @swagger
 * /supplier/products/{id}:
 *   delete:
 *     tags: [Suppliers]
 *     summary: Delete supplier product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/products/:id', verify('supplier'), controller.deleteProduct);

// supplier order items
/**
 * @swagger
 * /supplier/order-items:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get supplier order items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/order-items', verify('supplier'), controller.getOwnOrderItems);
/**
 * @swagger
 * /supplier/order-items/{id}/status:
 *   patch:
 *     tags: [Suppliers]
 *     summary: Update order item status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/order-items/:id/status', verify('supplier'), controller.updateOwnOrderItemStatus);

export default router;
