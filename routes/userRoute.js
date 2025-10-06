import express from 'express';
import * as controller from '#controllers/userController.js';
import validate from '#middleware/validate.js';
import { updateUserValidation } from '#validations/user/update.js';

const router = express.Router();

router.patch('/:user_id', validate(updateUserValidation), controller.update);

export default router;
