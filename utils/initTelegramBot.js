import { bot } from './telegramNotifier.js';

/**
 * Инициализирует Telegram бота при запуске сервера
 */
export const initTelegramBot = () => {
  if (!bot) {
    console.log('Telegram бот не настроен. Проверьте переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID');
    return;
  }

  console.log('Telegram бот успешно инициализирован');
  
  // Обработка ошибок бота
  bot.on('polling_error', (error) => {
    console.error('Ошибка в работе Telegram бота:', error.message);
  });
  
  // Логирование успешного запуска
  bot.on('webhook_error', (error) => {
    console.error('Ошибка webhook Telegram бота:', error.message);
  });
};

export default initTelegramBot; 