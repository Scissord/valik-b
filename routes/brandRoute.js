import express from 'express';
import * as controller from '#controllers/brandController.js';
import validate from '#middleware/validate.js';
import { createBrandValidation } from '#validations/brand/create.js';
import { updateBrandValidation } from '#validations/brand/update.js';
import { deleteBrandValidation } from '#validations/brand/delete.js';

const router = express.Router();

router.get('',  controller.get);
router.post('', validate(createBrandValidation), controller.create);
router.patch('/:brand_id', validate(updateBrandValidation), controller.update);
router.delete('/:brand_id', validate(deleteBrandValidation), controller.softDelete);

export default router;
