import express from 'express';
import * as controller from '#controllers/categoryController.js';
import validate from '#middleware/validate.js';
import { findValidation } from '#validations/category/find.js';
import verify from '#middleware/verify.js';

const router = express.Router();

// получить список всех категорий для админки по идее стоит сделать verify('supplier') но пока поху
router.get('', controller.get);

// создать категорию
router.post('', verify('supplier'), controller.create);

// обновить категорию
router.patch('/:category_id', verify('supplier'), controller.update);

// удалить категорию
router.delete('/:category_id', verify('supplier'), controller.softDelete);

// получить в виде дерева для фронта любой чел
router.get('/tree', controller.getTree);

// получить инфу о подкатегориях
router.get('/:category_id', validate(findValidation), controller.find);

export default router;
