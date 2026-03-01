import express from 'express';
import * as controller from '#controllers/userController.js';
import validate from '#middleware/validate.js';
import { updateUserValidation } from '#validations/user/update.js';

const router = express.Router();

/**
 * @swagger
 * /users/{user_id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: user_id
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
router.patch('/:user_id', validate(updateUserValidation), controller.update);

export default router;
