import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import * as Supplier from '#models/supplier.js';
import * as User from '#models/user.js';
import * as telegramAuth from './telegramAuth.js';

dotenv.config();

const token = process.env.TELEGRAM_SUPPLIER_BOT_TOKEN;

let bot;

try {
  if (token) {
    bot = new TelegramBot(token, { polling: true });
    setupBotCommands();
  }
} catch (error) {
  console.error('Ошибка инициализации Telegram бота для поставщиков:', error.message);
}

function setupBotCommands() {
  if (!bot) return;

  bot.onText(/\/start/, async msg => {
    const userId = msg.chat.id;

    try {
      const session = await telegramAuth.autoAuthByTelegramId(userId);
      if (session && session.role === 'supplier') {
        const name = session.user.name || session.user.login || '';
        bot.sendMessage(userId, `Добро пожаловать, ${name}! Вы авторизованы как поставщик.`);
        sendSupplierMainMenu(userId, 'Панель поставщика:');
        return;
      } else if (session && (session.role === 'client' || session.role === 'admin')) {
        bot.sendMessage(userId, 'Этот бот только для поставщиков. Используйте соответствующего бота.');
        telegramAuth.logout(userId);
        return;
      }
    } catch (e) {}

    if (telegramAuth.isAuthenticated(userId)) {
      const role = telegramAuth.getUserRole(userId);
      if (role === 'supplier') {
        sendSupplierMainMenu(userId, 'Панель поставщика:');
      } else {
        bot.sendMessage(userId, 'Этот бот только для поставщиков.');
        telegramAuth.logout(userId);
      }
    } else {
      sendAuthMenu(userId, 'Для начала необходимо авторизоваться:');
    }
  });

  bot.onText(/\/help/, msg => {
    const userId = msg.chat.id;
    let text = 'Команды поставщика:\n\n';
    text += '/start - Главное меню\n';
    text += '/help - Список команд\n';
    text += '/menu - Главное меню\n';
    text += '/logout - Выход\n';
    bot.sendMessage(userId, text);
  });

  bot.onText(/\/menu/, msg => {
    const userId = msg.chat.id;
    if (telegramAuth.isAuthenticated(userId) && telegramAuth.getUserRole(userId) === 'supplier') {
      sendSupplierMainMenu(userId, 'Панель поставщика:');
    } else {
      sendAuthMenu(userId, 'Для начала необходимо авторизоваться:');
    }
  });

  bot.onText(/\/logout/, msg => {
    const userId = msg.chat.id;
    telegramAuth.logout(userId);
    bot.sendMessage(userId, 'Вы вышли из аккаунта.');
    sendAuthMenu(userId, 'Авторизуйтесь для продолжения:');
  });

  bot.on('message', async msg => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const userId = msg.chat.id;
    const session = telegramAuth.getSession(userId);
    if (!session || !session.authState) return;

    if (session.authState === 'awaiting_supplier_login') {
      session.login = msg.text.trim();
      session.authState = 'awaiting_supplier_password';
      bot.sendMessage(userId, 'Введите пароль поставщика:');
    } else if (session.authState === 'awaiting_supplier_password') {
      const password = msg.text.trim();
      const login = session.login;

      const authData = await telegramAuth.authSupplier(login, password);

      delete session.authState;
      delete session.login;

      if (authData) {
        try {
          await Supplier.update(authData.user.id, { telegram_id: String(userId) });
        } catch (e) {}
        telegramAuth.createSession(userId, authData);
        bot.sendMessage(userId, 'Авторизация поставщика успешна!');
        sendSupplierMainMenu(userId, 'Панель поставщика:');
      } else {
        bot.sendMessage(userId, 'Неверный логин или пароль.');
        sendAuthMenu(userId, 'Попробуйте снова:');
      }
    }
  });

  bot.on('callback_query', async callbackQuery => {
    const data = callbackQuery.data;
    const msg = callbackQuery.message;
    const userId = msg.chat.id;

    const [action, id, value] = data.split(':');

    try {
      if (action === 'auth') {
        if (id === 'supplier') {
          telegramAuth.startAdminAuthProcess(userId); // временно используем общий механизм
          const session = telegramAuth.getSession(userId) || telegramAuth.createSession(userId, {});
          session.authState = 'awaiting_supplier_login';
          bot.sendMessage(userId, 'Введите логин поставщика:');
          bot.answerCallbackQuery(callbackQuery.id);
        }
        return;
      }

      if (!telegramAuth.isAuthenticated(userId) || telegramAuth.getUserRole(userId) !== 'supplier') {
        bot.sendMessage(userId, 'Необходимо авторизоваться как поставщик.');
        sendAuthMenu(userId, 'Авторизация:');
        bot.answerCallbackQuery(callbackQuery.id);
        return;
      }

      if (action === 'supplier') {
        if (id === 'items') {
          await showSupplierItems(userId);
        } else if (id === 'filter') {
          await sendSupplierFilterMenu(userId);
        } else if (id === 'back_to_menu') {
          sendSupplierMainMenu(userId, 'Панель поставщика:');
        } else if (id === 'item') {
          await showSupplierItem(userId, value);
        }
      } else if (action === 'itemstatus') {
        const itemId = id;
        const newStatus = parseInt(value);
        await changeItemStatus(userId, itemId, newStatus);
      }
    } catch (error) {
      console.error('Ошибка обработки запроса поставщика:', error);
      bot.sendMessage(userId, `Ошибка: ${error.message}`);
    }

    bot.answerCallbackQuery(callbackQuery.id);
  });
}

async function sendAuthMenu(chatId, message) {
  const keyboard = { inline_keyboard: [[{ text: 'Войти как поставщик', callback_data: 'auth:supplier' }]] };
  bot.sendMessage(chatId, message, { reply_markup: keyboard });
}

async function sendSupplierMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Мои позиции', callback_data: 'supplier:items' }],
      [{ text: 'Фильтр по статусу', callback_data: 'supplier:filter' }],
      [{ text: 'Выйти', callback_data: 'logout' }]
    ]
  };
  bot.sendMessage(chatId, message, { reply_markup: keyboard });
}

async function sendSupplierFilterMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: 'Ожидает', callback_data: 'supplier:items:0' },
        { text: 'В сборке', callback_data: 'supplier:items:1' }
      ],
      [
        { text: 'Готов к отправке', callback_data: 'supplier:items:2' },
        { text: 'В пути', callback_data: 'supplier:items:3' }
      ],
      [
        { text: 'Доставлен', callback_data: 'supplier:items:4' },
        { text: 'Отменен', callback_data: 'supplier:items:5' }
      ],
      [{ text: 'Назад', callback_data: 'supplier:back_to_menu' }]
    ]
  };
  bot.sendMessage(chatId, 'Выберите статус:', { reply_markup: keyboard });
}

async function showSupplierItems(chatId, status) {
  const session = telegramAuth.getSession(chatId);
  const supplierId = session?.user?.id;
  if (!supplierId) {
    bot.sendMessage(chatId, 'Необходимо авторизоваться.');
    return;
  }

  const items = await OrderItem.getForSupplier(supplierId, { status, limit: 20, page: 1 });
  if (!items || items.length === 0) {
    bot.sendMessage(chatId, 'Позиций не найдено.');
    return;
  }

  let message = '*Ваши позиции:*';
  const keyboard = { inline_keyboard: [] };

  for (const item of items) {
    const product = await Product.find(item.product_id);
    const name = product ? (product.title || product.name) : `Товар #${item.product_id}`;
    message += `#${item.id} • ${name} • ${item.quantity} шт. • ${item.total} ₸\n`;
    keyboard.inline_keyboard.push([
      { text: `Позиция #${item.id}`, callback_data: `supplier:item:${item.id}` }
    ]);
  }

  keyboard.inline_keyboard.push([{ text: 'В меню', callback_data: 'supplier:back_to_menu' }]);

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
}

async function showSupplierItem(chatId, itemId) {
  const item = await OrderItem.find(itemId);
  if (!item) {
    bot.sendMessage(chatId, 'Позиция не найдена.');
    return;
  }
  
  // Получаем информацию о товаре
  const product = await Product.find(item.product_id);
  const productName = product ? (product.title || product.name) : `Товар #${item.product_id}`;
  
  // Получаем информацию о заказе
  const order = await Order.find(item.order_id);
  
  // Получаем информацию о клиенте
  let clientInfo = 'Не указан';
  let clientPhone = '';
  if (order && order.user_id) {
    const client = await User.find(order.user_id);
    if (client) {
      clientInfo = client.name || client.login || `ID: ${client.id}`;
      if (client.phone) {
        clientPhone = client.phone;
      }
    }
  }

  let message = `🛍️ *Позиция #${item.id}*\n\n`;
  
  // Информация о товаре
  message += `📦 *Товар:* ${productName}\n`;
  if (product) {
    if (product.article) message += `🏷️ *Артикул:* ${product.article}\n`;
    if (product.price) message += `💰 *Цена за единицу:* ${product.price} ₸\n`;
    if (product.description) {
      const shortDesc = product.description.length > 100 
        ? product.description.substring(0, 100) + '...' 
        : product.description;
      message += `📝 *Описание:* ${shortDesc}\n`;
    }
  }
  
  message += `\n📊 *Детали позиции:*\n`;
  message += `🔢 *Количество:* ${item.quantity}\n`;
  message += `💵 *Сумма позиции:* ${item.total} ₸\n`;
  message += `📋 *Статус позиции:* ${item.status}\n`;
  
  message += `\n🛒 *Информация о заказе:*\n`;
  message += `👤 *Клиент:* ${clientInfo}\n`;
  if (clientPhone) {
    message += `📞 *Телефон:* ${clientPhone}\n`;
  }

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔧 В сборке', callback_data: `itemstatus:${item.id}:1` },
        { text: '📦 Готов к отправке', callback_data: `itemstatus:${item.id}:2` }
      ],
      [
        { text: '🚚 В пути', callback_data: `itemstatus:${item.id}:3` },
        { text: '✅ Доставлен', callback_data: `itemstatus:${item.id}:4` }
      ],
      [{ text: '❌ Отменить', callback_data: `itemstatus:${item.id}:5` }],
      [{ text: '⬅️ Назад', callback_data: 'supplier:items' }]
    ]
  };

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown', reply_markup: keyboard });
}

async function changeItemStatus(chatId, itemId, status) {
  try {
    const session = telegramAuth.getSession(chatId);
    const supplierId = session?.user?.id;
    const updated = await OrderItem.updateStatusOwned(itemId, supplierId, status);
    if (!updated) {
      bot.sendMessage(chatId, 'Позиция не найдена или не принадлежит вам.');
      return;
    }

    await Order.updateStatusIfAllItems(updated.order_id, status);

    bot.sendMessage(chatId, `Статус позиции #${itemId} обновлен на ${status}.`);
    await showSupplierItem(chatId, itemId);
  } catch (e) {
    bot.sendMessage(chatId, 'Ошибка обновления статуса.');
  }
}

export { bot };

/**
 * Отправляет уведомление поставщикам о новом заказе
 * @param {Object} order - Объект заказа
 * @param {Array} items - Товары в заказе
 */
export const sendOrderNotification = async (order, items) => {
  if (!bot) {
    console.error('Telegram бот для поставщиков не настроен. Проверьте переменную окружения TELEGRAM_SUPPLIER_BOT_TOKEN');
    return;
  }

  try {
    // Группируем товары по поставщикам
    const supplierItems = {};
    
    for (const item of items) {
      const product = await Product.find(item.product_id);
      if (product && product.supplier_id) {
        if (!supplierItems[product.supplier_id]) {
          supplierItems[product.supplier_id] = [];
        }
        supplierItems[product.supplier_id].push({
          ...item,
          product_name: product.title || product.name || `Товар #${product.id}`
        });
      }
    }

    // Получаем информацию о клиенте
    const client = await User.find(order.user_id);
    const clientName = client ? (client.name || client.login || 'Клиент') : 'Клиент';

    // Отправляем уведомления каждому поставщику
    for (const [supplierId, supplierItemsList] of Object.entries(supplierItems)) {
      try {
        // Получаем информацию о поставщике
        const supplier = await Supplier.find(supplierId);
        if (!supplier || !supplier.telegram_id) {
          console.log(`Поставщик ${supplierId} не имеет Telegram ID`);
          continue;
        }

        // Формируем сообщение для поставщика
        let message = `🆕 *Новый заказ #${order.id}*\n\n`;
        message += `👤 Клиент: ${clientName}\n`;
        message += `📅 Дата: ${new Date(order.created_at).toLocaleString('ru-RU')}\n\n`;
        message += `📦 *Ваши позиции:*\n`;

        let totalSupplierAmount = 0;
        for (const item of supplierItemsList) {
          message += `• ${item.product_name}\n`;
          message += `  Количество: ${item.quantity} шт.\n`;
          message += `  Сумма: ${item.total} ₸\n\n`;
          totalSupplierAmount += parseFloat(item.total) || 0;
        }

        message += `💰 *Общая сумма ваших позиций: ${totalSupplierAmount} ₸*\n\n`;
        message += `📱 Используйте команду /menu для управления заказами`;

        // Создаем кнопки для быстрых действий
        const keyboard = {
          inline_keyboard: [
            [
              { text: 'Мои позиции', callback_data: 'supplier:items' }
            ],
            [
              { text: 'Фильтр по статусу', callback_data: 'supplier:filter' }
            ]
          ]
        };

        // Отправляем уведомление поставщику
        await bot.sendMessage(supplier.telegram_id, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });

        console.log(`Уведомление о заказе #${order.id} отправлено поставщику ${supplier.name || supplier.login}`);

      } catch (err) {
        console.error(`Ошибка отправки уведомления поставщику ${supplierId}:`, err.message);
      }
    }

  } catch (error) {
    console.error('Ошибка отправки уведомлений поставщикам:', error.message);
  }
};
