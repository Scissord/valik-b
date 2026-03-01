import express from 'express';
import * as controller from '#controllers/unitController.js';
import validate from '#middleware/validate.js';
import { createUnitValidation } from '#validations/unit/create.js';
import { updateUnitValidation } from '#validations/unit/update.js';
import { deleteUnitValidation } from '#validations/unit/delete.js';

const router = express.Router();

/**
 * @swagger
 * /units:
 *   get:
 *     tags: [Units]
 *     summary: Get units
 *     responses:
 *       200:
 *         description: OK
 */
router.get('', controller.get);
/**
 * @swagger
 * /units:
 *   post:
 *     tags: [Units]
 *     summary: Create unit
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
router.post('', validate(createUnitValidation), controller.create);
/**
 * @swagger
 * /units/{unit_id}:
 *   patch:
 *     tags: [Units]
 *     summary: Update unit
 *     parameters:
 *       - in: path
 *         name: unit_id
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
router.patch('/:unit_id', validate(updateUnitValidation), controller.update);
/**
 * @swagger
 * /units/{unit_id}:
 *   delete:
 *     tags: [Units]
 *     summary: Delete unit
 *     parameters:
 *       - in: path
 *         name: unit_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:unit_id', validate(deleteUnitValidation), controller.softDelete);

export default router;
