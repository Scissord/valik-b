import express from 'express';
import * as controller from '#controllers/searchController.js';
import validate from '#middleware/validate.js';
import { searchValidation } from '#validations/search/search.js';

const router = express.Router();

router.get('', validate(searchValidation), controller.search);
router.get('/create_index', controller.createIndex);

export default router;
