import express from 'express';
import * as controller from '#controllers/categoryController.js';

const router = express.Router();

router.get('', controller.get);
router.get('/:category_id', controller.find);

export default router;
