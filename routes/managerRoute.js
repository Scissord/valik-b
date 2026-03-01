import { Router } from 'express';
import * as managerController from '#controllers/managerController.js';
import verify from '#middleware/verify.js';
import { createManagerValidation, updateManagerValidation } from '#validations/manager/index.js';
import validate from '#middleware/validate.js';

const router = Router();

/**
 * @swagger
 * /managers:
 *   get:
 *     tags: [Managers]
 *     summary: Get managers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
// Получить список всех менеджеров
router.get('/', verify('user'), managerController.getManagers);

/**
 * @swagger
 * /managers:
 *   post:
 *     tags: [Managers]
 *     summary: Create manager
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
// Создать нового менеджера
router.post('/', [verify('user'), validate(createManagerValidation)], managerController.createManager);

/**
 * @swagger
 * /managers/{id}:
 *   put:
 *     tags: [Managers]
 *     summary: Update manager
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
// Обновить данные менеджера
router.put('/:id', [verify('user'), validate(updateManagerValidation)], managerController.updateManager);

/**
 * @swagger
 * /managers/{id}:
 *   delete:
 *     tags: [Managers]
 *     summary: Delete manager
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
// Удалить менеджера
router.delete('/:id', verify('user'), managerController.deleteManager);

export default router;