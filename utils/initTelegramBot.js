import { bot as clientBot } from './telegramNotifier.js';
import { bot as managerBot } from './telegramManagerBot.js';
import * as telegramAuth from './telegramAuth.js';

/**
 * Инициализирует Telegram ботов при запуске сервера
 */
export const initTelegramBot = () => {
  // Инициализация клиентского бота
  if (!clientBot) {
    console.log('Telegram клиентский бот не настроен. Проверьте переменные окружения TELEGRAM_CLIENT_BOT_TOKEN и TELEGRAM_CLIENT_CHAT_ID');
  } else {
    console.log('Telegram клиентский бот успешно инициализирован');
    
    // Обработка ошибок бота
    clientBot.on('polling_error', (error) => {
      console.error('Ошибка в работе Telegram клиентского бота:', error.message);
    });
    
    // Логирование ошибок webhook
    clientBot.on('webhook_error', (error) => {
      console.error('Ошибка webhook Telegram клиентского бота:', error.message);
    });
  }
  
  // Инициализация бота для менеджеров
  if (!managerBot) {
    console.log('Telegram бот для менеджеров не настроен. Проверьте переменные окружения TELEGRAM_MANAGER_BOT_TOKEN и TELEGRAM_MANAGER_CHAT_ID');
  } else {
    console.log('Telegram бот для менеджеров успешно инициализирован');
    
    // Обработка ошибок бота
    managerBot.on('polling_error', (error) => {
      console.error('Ошибка в работе Telegram бота для менеджеров:', error.message);
    });
    
    // Логирование ошибок webhook
    managerBot.on('webhook_error', (error) => {
      console.error('Ошибка webhook Telegram бота для менеджеров:', error.message);
    });
  }

  // Настройка периодической очистки сессий
  setInterval(() => {
    telegramAuth.cleanupSessions();
  }, 1000 * 60 * 60); // Каждый час
};

export default initTelegramBot; 