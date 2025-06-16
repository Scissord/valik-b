import express from 'express';
import * as controller from '#controllers/unitController.js';
import validate from '#middleware/validate.js';

const router = express.Router();

router.get('', controller.get);

export default router;
