import express from 'express';
import * as controller from '#controllers/awsController.js';

const router = express.Router();

router.post('/upload', controller.upload);
router.get('/get-file-url', controller.getFileUrl);

export default router;
