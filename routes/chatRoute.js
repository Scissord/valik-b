import { Router } from 'express';
import { sendMessage, getChats, getChatMessages, deleteChat } from '#controllers/chatController.js';

const router = Router();

// Отправить сообщение (создать новый чат или добавить в существующий)
router.post('/message', sendMessage);

// Получить список чатов пользователя
router.get('/', getChats);

// Получить историю сообщений чата
router.get('/:chatId', getChatMessages);

// Удалить чат
router.delete('/:chatId', deleteChat);

export default router; 