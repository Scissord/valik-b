import express from 'express';
import * as controller from '#controllers/searchController.js';
import validate from '#middleware/validate.js';
import { searchValidation } from '#validations/search/search.js';

const router = express.Router();

/**
 * @swagger
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Search products
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('', validate(searchValidation), controller.search);
/**
 * @swagger
 * /search/create_index:
 *   get:
 *     tags: [Search]
 *     summary: Create search index
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/create_index', controller.createIndex);

export default router;
