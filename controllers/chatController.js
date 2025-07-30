import { getChatResponseAndSave } from '#services/AI/openaiService.js';
import * as chatModel from '#models/chat.js';
import * as chatMessageModel from '#models/chatMessage.js';

// Создание нового сообщения в чате или создание нового чата
export const sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Сообщение обязательно'
      });
    }

    const result = await getChatResponseAndSave(chatId, userId, message);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Ошибка в контроллере чата:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Внутренняя ошибка сервера'
    });
  }
};

// Получение списка чатов пользователя
export const getChats = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Необходима аутентификация'
      });
    }

    const chats = await chatModel.getChatsForUser(userId);

    return res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Внутренняя ошибка сервера'
    });
  }
};

// Получение истории сообщений чата
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user ? req.user.id : null;

    // Проверяем, существует ли чат и принадлежит ли он пользователю
    const chat = await chatModel.find(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Чат не найден'
      });
    }
    
    // Преобразуем оба значения в строки перед сравнением
    if (userId && String(chat.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    const messages = await chatMessageModel.getByChatId(chatId);

    return res.status(200).json({
      success: true,
      data: {
        chat,
        messages
      }
    });
  } catch (error) {
    console.error('Ошибка при получении сообщений чата:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Внутренняя ошибка сервера'
    });
  }
};

// Удаление чата
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user ? req.user.id : null;

    // Проверяем, существует ли чат и принадлежит ли он пользователю
    const chat = await chatModel.find(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Чат не найден'
      });
    }

    // Преобразуем оба значения в строки перед сравнением
    if (userId && String(chat.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    await chatModel.softDelete(chatId);

    return res.status(200).json({
      success: true,
      message: 'Чат успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении чата:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Внутренняя ошибка сервера'
    });
  }
}; 