import { Router } from 'express';
import { askAssistant } from '#controllers/assistantController.js';

const router = Router();

router.post('/', askAssistant);

export default router; 