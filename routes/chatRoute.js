import { Router } from 'express';
import { sendMessage, getChats, getChatMessages, deleteChat } from '#controllers/chatController.js';
import verify from '#middleware/verify.js';

const router = Router();

// Отправить сообщение (создать новый чат или добавить в существующий)
router.post('/message', verify('user'), sendMessage);

// Получить список чатов пользователя
router.get('/', verify('user'), getChats);

// Получить историю сообщений чата
router.get('/:chatId', verify('user'), getChatMessages);

// Удалить чат
router.delete('/:chatId', verify('user'), deleteChat);

export default router; 