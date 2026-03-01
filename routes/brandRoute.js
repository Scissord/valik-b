import express from 'express';
import * as controller from '#controllers/brandController.js';
import validate from '#middleware/validate.js';
import { createBrandValidation } from '#validations/brand/create.js';
import { updateBrandValidation } from '#validations/brand/update.js';
import { deleteBrandValidation } from '#validations/brand/delete.js';

const router = express.Router();

/**
 * @swagger
 * /brands:
 *   get:
 *     tags: [Brands]
 *     summary: Get brands
 *     responses:
 *       200:
 *         description: OK
 */
router.get('',  controller.get);
/**
 * @swagger
 * /brands:
 *   post:
 *     tags: [Brands]
 *     summary: Create brand
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
router.post('', validate(createBrandValidation), controller.create);
/**
 * @swagger
 * /brands/{brand_id}:
 *   patch:
 *     tags: [Brands]
 *     summary: Update brand
 *     parameters:
 *       - in: path
 *         name: brand_id
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
router.patch('/:brand_id', validate(updateBrandValidation), controller.update);
/**
 * @swagger
 * /brands/{brand_id}:
 *   delete:
 *     tags: [Brands]
 *     summary: Delete brand
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:brand_id', validate(deleteBrandValidation), controller.softDelete);

export default router;
