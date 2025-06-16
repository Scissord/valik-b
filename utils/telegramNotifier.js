import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

// Получаем токен и ID чата из переменных окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Создаем экземпляр бота
let bot;

try {
  if (token) {
    bot = new TelegramBot(token, { polling: false });
  }
} catch (error) {
  console.error('Ошибка инициализации Telegram бота:', error.message);
}

/**
 * Отправляет уведомление о новом заказе в Telegram
 * @param {Object} order - Объект заказа
 * @param {Array} items - Массив товаров в заказе
 */
export const sendOrderNotification = async (order, items) => {
  if (!bot || !chatId) {
    console.log('Telegram бот не настроен. Проверьте переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID');
    return;
  }

  try {
    // Формируем текст сообщения
    let message = `🔔 *НОВЫЙ ЗАКАЗ #${order.id}*\n\n`;
    message += `👤 *Клиент*: ${order.name}\n`;
    message += `📱 *Телефон*: ${order.phone}\n`;
    message += `💰 *Сумма*: ${order.total} ₸\n\n`;
    
    // Добавляем информацию о товарах
    message += `📋 *Товары*:\n`;
    
    for (const item of items) {
      message += `• ${item.name} x ${item.quantity} = ${item.total} ₸\n`;
    }
    
    message += `\n📅 *Дата*: ${new Date().toLocaleString('ru-RU')}\n`;

    // Отправляем сообщение
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('Уведомление о заказе отправлено в Telegram');
  } catch (error) {
    console.error('Ошибка отправки уведомления в Telegram:', error.message);
  }
};

export default {
  sendOrderNotification
}; 