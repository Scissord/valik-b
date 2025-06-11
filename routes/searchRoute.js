import express from 'express';
import * as controller from '#controllers/searchController.js';

const router = express.Router();

router.get('', controller.search);
router.get('/create_index', controller.createIndex);

export default router;
