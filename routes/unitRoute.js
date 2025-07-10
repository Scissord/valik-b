import express from 'express';
import * as controller from '#controllers/unitController.js';
import validate from '#middleware/validate.js';
import { createUnitValidation } from '#validations/unit/create.js';
import { updateUnitValidation } from '#validations/unit/update.js';
import { deleteUnitValidation } from '#validations/unit/delete.js';

const router = express.Router();

router.get('', controller.get);
router.post('', validate(createUnitValidation), controller.create);
router.patch('/:unit_id', validate(updateUnitValidation), controller.update);
router.delete('/:unit_id', validate(deleteUnitValidation), controller.softDelete);

export default router;
