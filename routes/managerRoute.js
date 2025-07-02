import { Router } from 'express';
import * as managerController from '#controllers/managerController.js';
import verify from '#middleware/verify.js';
import { createManagerValidation, updateManagerValidation } from '#validations/manager/index.js';
import validate from '#middleware/validate.js';

const router = Router();

// Получить список всех менеджеров
router.get('/', verify('user'), managerController.getManagers);

// Создать нового менеджера
router.post('/', [verify('user'), validate(createManagerValidation)], managerController.createManager);

// Обновить данные менеджера
router.put('/:id', [verify('user'), validate(updateManagerValidation)], managerController.updateManager);

// Удалить менеджера
router.delete('/:id', verify('user'), managerController.deleteManager);

export default router; 