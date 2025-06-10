import OpenAI from 'openai';
import * as chatModel from '#models/chat.js';
import * as chatMessageModel from '#models/chatMessage.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Системный промпт
const SYSTEM_PROMPT = 'Ты строительный ассистент. Отвечай кратко, по делу, давай расчёты бетона, цемента, песка, материалов. Отвечай понятно для прораба.';

export const getChatResponseAndSave = async (chatId, userId, userMessage) => {
  try {
    // Создаем новый чат, если chatId не указан
    let chat;
    if (!chatId) {
      chat = await chatModel.create({
        user_id: userId,
        title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '') // Первые 30 символов вопроса как заголовок
      });
      chatId = chat.id;
      
      // Сохраняем системное сообщение
      await chatMessageModel.create({
        chat_id: chatId,
        role: 'system',
        content: SYSTEM_PROMPT
      });
    } else {
      chat = await chatModel.find(chatId);
      if (!chat) {
        throw new Error('Чат не найден');
      }
      
      // Обновляем время последнего обновления чата
      await chatModel.update(chatId, { updated_at: new Date() });
    }
    
    // Сохраняем сообщение пользователя
    await chatMessageModel.create({
      chat_id: chatId,
      role: 'user',
      content: userMessage
    });
    
    // Получаем все сообщения чата
    const messages = await chatMessageModel.getByChatId(chatId);
    
    // Форматируем сообщения для OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Отправляем запрос в OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const assistantMessage = response.choices[0].message.content;
    
    // Сохраняем ответ ассистента
    await chatMessageModel.create({
      chat_id: chatId,
      role: 'assistant',
      content: assistantMessage
    });
    
    return {
      chatId,
      message: assistantMessage
    };
  } catch (error) {
    console.error('Ошибка при обращении к OpenAI:', error);
    throw new Error('Не удалось получить ответ от ассистента');
  }
};

// Для обратной совместимости
export const getConstructionAssistantResponse = async (question) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при обращении к OpenAI:', error);
    throw new Error('Не удалось получить ответ от ассистента');
  }
}; 