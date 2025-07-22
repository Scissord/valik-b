import express from 'express';
import * as controller from '#controllers/categoryController.js';
import validate from '#middleware/validate.js';
import { findValidation } from '#validations/category/find.js';

const router = express.Router();

// получить список всех категорий для админки по идее стоит сделать verify('supplier') но пока поху
router.get('', controller.get);

// получить в виде дерева для фронта любой чел
router.get('/tree', controller.getTree);

// получить инфу о подкатегориях
router.get('/:category_id', validate(findValidation), controller.find);

export default router;
