import OpenAI from 'openai';
import * as chatModel from '#models/chat.js';
import * as chatMessageModel from '#models/chatMessage.js';
import * as productModel from '#models/product.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const MAX_COMPLETION_TOKENS = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS) || 800;

// Функция для получения оптимизированного списка продуктов (фильтрация по запросу)
const getProductsForPrompt = async (userMessage) => {
  try {
    // Извлекаем простые ключевые слова из сообщения пользователя
    const keywords = String(userMessage || '')
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s,.-]/gi, ' ')
      .split(/[\s,.-]+/)
      .filter(Boolean)
      .filter(s => s.length >= 2)
      .slice(0, 8); // ограничим до 8 ключевых слов

    // Если ключевых слов нет — берём первые товары, иначе ищем по словам
    const products = keywords.length > 0
      ? await productModel.searchByKeywords(keywords, 60)
      : await productModel.get();
    if (!products || products.length === 0) {
      return '\n\nПродукты временно недоступны.';
    }
    
    // Ограничиваем количество продуктов до 60 (компактный формат)
    const limitedProducts = products.slice(0, 60);
    
    const productsList = limitedProducts.map(product => {
      // Сокращаем название если оно слишком длинное
      const shortTitle = product.title.length > 30 ? 
        product.title.substring(0, 30) + '...' : 
        product.title;
      
      return `${product.id}:${shortTitle}${product.price ? `(${product.price}₸)` : ''}`;
    }).join(', ');
    
    const totalCount = products.length;
    const showingText = totalCount > limitedProducts.length ? ` (показано ${limitedProducts.length} из ${totalCount})` : '';
    
    return `\n\n🏪 ДОСТУПНЫЕ ТОВАРЫ${showingText}: ${productsList}\n\n⚠️ ВАЖНО: Рекомендуй ТОЛЬКО товары из этого списка! НЕ придумывай новые ID или названия!`;
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    return '\n\nСписок товаров недоступен.';
  }
};

// Базовый системный промпт
const BASE_SYSTEM_PROMPT = 'Ты строительный ассистент интернет-магазина строительных материалов Valik.kz в Казахстане. Твоя главная задача - помочь клиентам выбрать подходящие материалы ТОЛЬКО из нашего ассортимента.\n\nКРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:\n1. 🚫 НИКОГДА НЕ ПРИДУМЫВАЙ товары, которых нет в списке\n2. 🚫 НИКОГДА НЕ УКАЗЫВАЙ несуществующие ID или названия\n3. ✅ РЕКОМЕНДУЙ ТОЛЬКО товары из предоставленного списка\n4. ✅ ВСЕГДА проверяй ID продукта перед рекомендацией\n5. ✅ Если нужного товара НЕТ в списке - честно скажи об этом\n6. ✅ Предлагай аналоги ТОЛЬКО из доступного ассортимента\n7. ✅ Указывай точные названия и ID из списка\n8. ✅ ВСЕ ЦЕНЫ в тенге (₸)\n\nПРИМЕР ПРАВИЛЬНОГО ОТВЕТА:\n"Для фундамента рекомендую из нашего ассортимента: Цемент М400 (ID: 5) - 8500₸. К сожалению, арматуры 12мм сейчас нет в наличии."\n\nПРИМЕР НЕПРАВИЛЬНОГО ОТВЕТА:\n"Рекомендую цемент М500 (ID: 999)" - ЕСЛИ ЭТОГО НЕТ В СПИСКЕ!';

export const getChatResponseAndSave = async (chatId, userId, userMessage) => {
  try {
    // Получаем актуальный список продуктов для системного промпта
    const productsInfo = await getProductsForPrompt(userMessage);
    const systemPrompt = BASE_SYSTEM_PROMPT + productsInfo;
    
    // Создаем новый чат, если chatId не указан
    let chat;
    if (!chatId) {
      chat = await chatModel.create({
        user_id: userId,
        title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '') // Первые 30 символов вопроса как заголовок
      });
      chatId = chat.id;
      
      // Сохраняем системное сообщение с актуальным списком продуктов
      await chatMessageModel.create({
        chat_id: chatId,
        role: 'system',
        content: systemPrompt
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
      model: OPENAI_MODEL,
      messages: formattedMessages,
      temperature: 1,
      max_completion_tokens: MAX_COMPLETION_TOKENS
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
    // Получаем актуальный список продуктов для системного промпта
    const productsInfo = await getProductsForPrompt(question);
    const systemPrompt = BASE_SYSTEM_PROMPT + productsInfo;
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_completion_tokens: MAX_COMPLETION_TOKENS
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при обращении к OpenAI:', error);
    throw new Error('Не удалось получить ответ от ассистента');
  }
}; 