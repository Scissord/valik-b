import { Router } from 'express';
import { askAssistant } from '#controllers/assistantController.js';

const router = Router();

/**
 * @swagger
 * /api/assistant:
 *   post:
 *     tags: [Assistant]
 *     summary: Ask assistant
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
router.post('/', askAssistant);

export default router;