import express from 'express';
import * as controller from '#controllers/categoryController.js';
import validate from '#middleware/validate.js';
import { findValidation } from '#validations/category/find.js';
import verify from '#middleware/verify.js';

const router = express.Router();

// получить список всех категорий для админки по идее стоит сделать verify('supplier') но пока поху
/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get categories
 *     responses:
 *       200:
 *         description: OK
 */
router.get('', controller.get);

// создать категорию
/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     security:
 *       - bearerAuth: []
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
router.post('', verify('supplier'), controller.create);

// обновить категорию
/**
 * @swagger
 * /categories/{category_id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
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
router.patch('/:category_id', verify('supplier'), controller.update);

// удалить категорию
/**
 * @swagger
 * /categories/{category_id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:category_id', verify('supplier'), controller.softDelete);

// получить в виде дерева для фронта любой чел
/**
 * @swagger
 * /categories/tree:
 *   get:
 *     tags: [Categories]
 *     summary: Get categories tree
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/tree', controller.getTree);

// получить инфу о подкатегориях
/**
 * @swagger
 * /categories/{category_id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by id
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:category_id', validate(findValidation), controller.find);

export default router;
