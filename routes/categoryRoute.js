import express from 'express';
import * as controller from '#controllers/categoryController.js';

const router = express.Router();

router.get('', controller.get);

export default router;
