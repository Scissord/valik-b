import express from 'express';
import * as controller from '#controllers/authController.js';
import verify from '#middleware/verify.js';
import {
  loginValidation,
  registrationValidation
} from '#validations/auth/index.js';
import validate from '#middleware/validate.js';

const router = express.Router();

// work with user authorization
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/login', validate(loginValidation), controller.userLogin);
/**
 * @swagger
 * /auth/registration:
 *   post:
 *     tags: [Auth]
 *     summary: User registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/registration', validate(registrationValidation), controller.userRegistration);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: User logout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/logout', verify('user'), controller.userLogout);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh user token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/refresh', verify('user'), controller.userRefresh);

export default router;
