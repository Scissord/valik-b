import express from 'express';
import * as controller from '#controllers/awsController.js';

const router = express.Router();

/**
 * @swagger
 * /aws/upload:
 *   post:
 *     tags: [AWS]
 *     summary: Upload file to S3
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
router.post('/upload', controller.upload);
/**
 * @swagger
 * /aws/get-file-url:
 *   get:
 *     tags: [AWS]
 *     summary: Get signed file URL
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/get-file-url', controller.getFileUrl);

export default router;
