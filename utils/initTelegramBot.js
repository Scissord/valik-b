import { bot as clientBot } from './telegramNotifier.js';
import { bot as managerBot } from './telegramManagerBot.js';
import { bot as supplierBot } from './telegramSupplierBot.js';
import * as telegramAuth from './telegramAuth.js';

/**
 * Инициализирует Telegram ботов при запуске сервера
 */
export const initTelegramBot = () => {
  const attachOneTimeErrorLogger = (botInstance, eventName, prefix) => {
    if (!botInstance) return;

    let logged = false;
    botInstance.on(eventName, error => {
      if (logged) return;
      logged = true;
      console.error(prefix, error?.message || error);
    });
  };

  // Инициализация клиентского бота
  if (!clientBot) {
    console.log('Telegram клиентский бот не настроен. Проверьте переменные окружения TELEGRAM_CLIENT_BOT_TOKEN и TELEGRAM_CLIENT_CHAT_ID');
  } else {
    console.log('Telegram клиентский бот успешно инициализирован');
    
    attachOneTimeErrorLogger(clientBot, 'polling_error', 'Ошибка в работе Telegram клиентского бота:');
    attachOneTimeErrorLogger(clientBot, 'webhook_error', 'Ошибка webhook Telegram клиентского бота:');
  }
  
  // Инициализация бота для менеджеров
  if (!managerBot) {
    console.log('Telegram бот для менеджеров не настроен. Проверьте переменные окружения TELEGRAM_MANAGER_BOT_TOKEN и TELEGRAM_MANAGER_CHAT_ID');
  } else {
    console.log('Telegram бот для менеджеров успешно инициализирован');
    
    attachOneTimeErrorLogger(managerBot, 'polling_error', 'Ошибка в работе Telegram бота для менеджеров:');
    attachOneTimeErrorLogger(managerBot, 'webhook_error', 'Ошибка webhook Telegram бота для менеджеров:');
  }

  // Инициализация бота для поставщиков
  if (!supplierBot) {
    console.log('Telegram бот для поставщиков не настроен. Проверьте TELEGRAM_SUPPLIER_BOT_TOKEN');
  } else {
    console.log('Telegram бот для поставщиков успешно инициализирован');
    attachOneTimeErrorLogger(supplierBot, 'polling_error', 'Ошибка в работе Telegram бота для поставщиков:');
    attachOneTimeErrorLogger(supplierBot, 'webhook_error', 'Ошибка webhook Telegram бота для поставщиков:');
  }

  // Настройка периодической очистки сессий
  setInterval(() => {
    telegramAuth.cleanupSessions();
  }, 1000 * 60 * 60); // Каждый час
};

export default initTelegramBot; 
