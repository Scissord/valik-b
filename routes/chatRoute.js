import { Router } from 'express';
import { sendMessage, getChats, getChatMessages, deleteChat } from '#controllers/chatController.js';
import verify from '#middleware/verify.js';

const router = Router();

// Отправить сообщение (создать новый чат или добавить в существующий)
/**
 * @swagger
 * /api/chats/message:
 *   post:
 *     tags: [Chats]
 *     summary: Send message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/message', verify('user'), sendMessage);

// Получить список чатов пользователя
/**
 * @swagger
 * /api/chats:
 *   get:
 *     tags: [Chats]
 *     summary: Get user chats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', verify('user'), getChats);

// Получить историю сообщений чата
/**
 * @swagger
 * /api/chats/{chatId}:
 *   get:
 *     tags: [Chats]
 *     summary: Get chat messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:chatId', verify('user'), getChatMessages);

// Удалить чат
/**
 * @swagger
 * /api/chats/{chatId}:
 *   delete:
 *     tags: [Chats]
 *     summary: Delete chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:chatId', verify('user'), deleteChat);

export default router; 