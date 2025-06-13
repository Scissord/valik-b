import express from 'express';
import * as controller from '#controllers/categoryController.js';
import validate from '#middleware/validate.js';
import { findValidation } from '#validations/category/find.js';

const router = express.Router();

router.get('', controller.get);
router.get('/:category_id', validate(findValidation), controller.find);

export default router;
