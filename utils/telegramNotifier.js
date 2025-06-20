import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import * as User from '#models/user.js';

dotenv.config();

// Получаем токен из переменных окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Статусы заказов
const ORDER_STATUSES = {
  0: 'Заказ создан',
  1: 'В сборке',
  2: 'Отправлен',
  3: 'Доставлен',
  4: 'Отменен'
};

// Создаем экземпляр бота с включенным polling для обработки команд
let bot;

try {
  if (token) {
    bot = new TelegramBot(token, { polling: true });
    setupBotCommands();
  }
} catch (error) {
  console.error('Ошибка инициализации Telegram бота:', error.message);
}

/**
 * Настраивает команды и обработчики событий бота
 */
function setupBotCommands() {
  if (!bot) return;

  // Обработка команды /start - показываем главное меню
  bot.onText(/\/start/, (msg) => {
    const userId = msg.chat.id;
    sendMainMenu(userId, 'Добро пожаловать! Выберите действие:');
  });

  // Обработка команды /help
  bot.onText(/\/help/, (msg) => {
    const userId = msg.chat.id;
    let helpText = 'Доступные команды:\n\n';
    helpText += '/start - Открыть главное меню\n';
    helpText += '/help - Показать список команд\n';
    helpText += '/menu - Открыть главное меню\n';
    
    bot.sendMessage(userId, helpText);
  });

  // Обработка команды /menu - показываем главное меню
  bot.onText(/\/menu/, (msg) => {
    const userId = msg.chat.id;
    sendMainMenu(userId, 'Выберите действие:');
  });

  // Обработка callback запросов от кнопок меню
  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const msg = callbackQuery.message;
    const userId = msg.chat.id;
    
    // Формат данных: action:orderId:value
    const [action, id, value] = data.split(':');
    
    try {
      switch (action) {
        case 'menu':
          // Обработка пунктов главного меню
          if (id === 'orders') {
            // Показать все заказы
            await showAllOrders(userId);
          } else if (id === 'filter') {
            // Показать меню фильтрации
            sendFilterMenu(userId);
          } else if (id === 'back') {
            // Вернуться в главное меню
            sendMainMenu(userId, 'Выберите действие:');
          }
          break;
          
        case 'filter':
          // Обработка фильтрации по статусу
          const statusCode = parseInt(id);
          await filterOrdersByStatus(userId, statusCode);
          break;
          
        case 'status':
          // Обновление статуса заказа
          const orderId = id;
          const newStatus = parseInt(value);
          
          // Обновляем статус заказа
          await Order.update(orderId, { status: newStatus });
          
          // Получаем обновленный заказ
          const updatedOrder = await Order.find(orderId);
          
          // Отправляем обновленную информацию
          await sendOrderStatusWithButtons(userId, updatedOrder);
          
          // Отвечаем на callback запрос
          bot.answerCallbackQuery(callbackQuery.id, { text: `Статус заказа #${orderId} обновлен на "${ORDER_STATUSES[newStatus]}"` });
          break;
          
        case 'view':
          // Просмотр деталей заказа
          const orderToView = await Order.find(id);
          if (!orderToView) {
            bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден' });
            return;
          }
          
          // Получаем детали заказа
          const items = await OrderItem.getByOrderId(id);
          let orderDetails = await getOrderDetails(orderToView, items);
          
          // Отправляем детальную информацию о заказе
          await bot.sendMessage(userId, orderDetails, { 
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Изменить статус', callback_data: `status:${id}:${orderToView.status}` }],
                [{ text: '« Назад к заказам', callback_data: 'menu:orders:' }],
                [{ text: '« Главное меню', callback_data: 'menu:back:' }]
              ]
            }
          });
          bot.answerCallbackQuery(callbackQuery.id);
          break;
      }
    } catch (error) {
      console.error('Ошибка при обработке callback запроса:', error);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка при обработке запроса' });
    }
  });
}

/**
 * Отправляет главное меню бота
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение над меню
 */
async function sendMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '📋 Все заказы', callback_data: 'menu:orders:' }],
      [{ text: '🔍 Фильтр заказов по статусу', callback_data: 'menu:filter:' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет меню фильтрации заказов по статусу
 * @param {number} chatId - ID чата
 */
async function sendFilterMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: ORDER_STATUSES[0], callback_data: `filter:0:` },
        { text: ORDER_STATUSES[1], callback_data: `filter:1:` }
      ],
      [
        { text: ORDER_STATUSES[2], callback_data: `filter:2:` },
        { text: ORDER_STATUSES[3], callback_data: `filter:3:` }
      ],
      [
        { text: ORDER_STATUSES[4], callback_data: `filter:4:` }
      ],
      [
        { text: '« Назад в меню', callback_data: 'menu:back:' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, 'Выберите статус заказа для фильтрации:', {
    reply_markup: keyboard
  });
}

/**
 * Показывает все заказы
 * @param {number} chatId - ID чата
 */
async function showAllOrders(chatId) {
  try {
    // Получаем заказы из базы данных
    const orders = await Order.getWhere({ deleted_at: null });
    
    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, 'Заказы не найдены', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '« Назад в меню', callback_data: 'menu:back:' }]
          ]
        }
      });
      return;
    }
    
    await sendOrdersList(chatId, orders, 'Все заказы');
  } catch (error) {
    console.error('Ошибка при получении списка заказов:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при получении списка заказов', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад в меню', callback_data: 'menu:back:' }]
        ]
      }
    });
  }
}

/**
 * Фильтрует заказы по статусу
 * @param {number} chatId - ID чата
 * @param {number} statusCode - Код статуса
 */
async function filterOrdersByStatus(chatId, statusCode) {
  try {
    // Получаем заказы с указанным статусом
    const orders = await Order.getWhere({ status: statusCode, deleted_at: null });
    
    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, `Заказы со статусом "${ORDER_STATUSES[statusCode]}" не найдены`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '« Назад к фильтрам', callback_data: 'menu:filter:' }],
            [{ text: '« Главное меню', callback_data: 'menu:back:' }]
          ]
        }
      });
      return;
    }
    
    await sendOrdersList(chatId, orders, `Заказы со статусом "${ORDER_STATUSES[statusCode]}"`);
  } catch (error) {
    console.error('Ошибка при фильтрации заказов по статусу:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при фильтрации заказов', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад к фильтрам', callback_data: 'menu:filter:' }],
          [{ text: '« Главное меню', callback_data: 'menu:back:' }]
        ]
      }
    });
  }
}

/**
 * Отправляет список заказов с кнопками для просмотра деталей
 * @param {number} chatId - ID чата
 * @param {Array} orders - Массив заказов
 * @param {string} title - Заголовок сообщения
 */
async function sendOrdersList(chatId, orders, title) {
  let message = `*${title}:*\n\n`;
  
  for (const order of orders) {
    const status = ORDER_STATUSES[order.status] || 'Неизвестный статус';
    message += `📦 *Заказ #${order.id}*\n`;
    message += `💰 Сумма: ${order.total || 0} ₸\n`;
    message += `🔄 Статус: ${status}\n`;
    message += `📅 Дата: ${new Date(+order.created_at).toLocaleString('ru-RU')}\n\n`;
  }
  
  // Создаем кнопки для каждого заказа
  const orderButtons = orders.map(order => [
    { text: `📋 Детали заказа #${order.id}`, callback_data: `view:${order.id}:details` }
  ]);
  
  // Добавляем кнопки навигации
  const navigationButtons = [
    [{ text: '« Назад в меню', callback_data: 'menu:back:' }]
  ];
  
  // Объединяем все кнопки
  const keyboard = {
    inline_keyboard: [...orderButtons, ...navigationButtons]
  };
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Получает детальную информацию о заказе и его товарах
 * @param {Object} order - Объект заказа
 * @param {Array} items - Массив товаров в заказе
 * @returns {string} - Форматированное сообщение с деталями заказа
 */
async function getOrderDetails(order, items) {
  let message = `📦 *ДЕТАЛИ ЗАКАЗА #${order.id}*\n\n`;
  
  // Получаем информацию о пользователе
  let userName = 'Не указан';
  let userPhone = 'Не указан';
  
  if (order.user_id) {
    try {
      const user = await User.find(order.user_id);
      if (user) {
        userName = user.name || user.login || 'Не указан';
        userPhone = user.phone || 'Не указан';
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
    }
  }
  
  // Информация о клиенте
  message += `👤 *Клиент*: ${userName}\n`;
  message += `📱 *Телефон*: ${userPhone}\n`;
  message += `💰 *Сумма*: ${order.total || 0} ₸\n`;
  message += `🔄 *Статус*: ${ORDER_STATUSES[order.status] || 'Неизвестный статус'}\n\n`;
  
  // Информация о товарах
  message += `📋 *Товары:*\n`;
  
  if (Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      try {
        const product = await Product.find(item.product_id);
        message += `• ${product?.title || product?.name || 'Товар'} x ${item.quantity} = ${item.total} ₸\n`;
      } catch (error) {
        message += `• Товар ID: ${item.product_id} x ${item.quantity} = ${item.total} ₸\n`;
      }
    }
  } else {
    message += `• Информация о товарах отсутствует\n`;
  }
  
  message += `\n📅 *Дата создания*: ${new Date(+order.created_at).toLocaleString('ru-RU')}\n`;
  if (order.updated_at) {
    message += `📝 *Последнее обновление*: ${new Date(+order.updated_at).toLocaleString('ru-RU')}\n`;
  }
  
  return message;
}

/**
 * Отправляет информацию о статусе заказа с кнопками для изменения статуса
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function sendOrderStatusWithButtons(chatId, order) {
  const status = ORDER_STATUSES[order.status] || 'Неизвестный статус';
  
  // Получаем информацию о пользователе
  let userName = 'Не указан';
  let userPhone = 'Не указан';
  
  if (order.user_id) {
    try {
      const user = await User.find(order.user_id);
      if (user) {
        userName = user.name || user.login || 'Не указан';
        userPhone = user.phone || 'Не указан';
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
    }
  }
  
  let message = `📦 *Заказ #${order.id}*\n\n`;
  message += `👤 *Клиент*: ${userName}\n`;
  message += `📱 *Телефон*: ${userPhone}\n`;
  message += `💰 *Сумма*: ${order.total || 0} ₸\n`;
  message += `🔄 *Статус*: ${status}\n`;
  message += `📅 *Дата*: ${new Date(+order.created_at).toLocaleString('ru-RU')}\n\n`;
  message += `Выберите новый статус заказа:`;
  
  // Создаем кнопки для изменения статуса (без кнопки "Заказ создан")
  const keyboard = {
    inline_keyboard: [
      [
        { text: ORDER_STATUSES[1], callback_data: `status:${order.id}:1` },
        { text: ORDER_STATUSES[2], callback_data: `status:${order.id}:2` }
      ],
      [
        { text: ORDER_STATUSES[3], callback_data: `status:${order.id}:3` },
        { text: ORDER_STATUSES[4], callback_data: `status:${order.id}:4` }
      ],
      [
        { text: 'Показать детали заказа', callback_data: `view:${order.id}:details` }
      ],
      [
        { text: '« Назад к заказам', callback_data: 'menu:orders:' },
        { text: '« Главное меню', callback_data: 'menu:back:' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Отправляет уведомление о новом заказе в Telegram с кнопками управления
 * @param {Object} order - Объект заказа
 * @param {Array} items - Массив товаров в заказе
 */
export const sendOrderNotification = async (order, items) => {
  if (!bot || !chatId) {
    console.log('Telegram бот не настроен. Проверьте переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID');
    return;
  }

  try {
    // Получаем информацию о пользователе
    let userName = 'Не указан';
    let userPhone = 'Не указан';
    
    if (order.user_id) {
      try {
        const user = await User.find(order.user_id);
        if (user) {
          userName = user.name || user.login || 'Не указан';
          userPhone = user.phone || 'Не указан';
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    }

    // Формируем текст сообщения
    let message = `🔔 *НОВЫЙ ЗАКАЗ #${order.id}*\n\n`;
    message += `👤 *Клиент*: ${userName}\n`;
    message += `📱 *Телефон*: ${userPhone}\n`;
    message += `💰 *Сумма*: ${order.total || 0} ₸\n\n`;
    
    // Добавляем информацию о товарах
    message += `📋 *Товары*:\n`;
    
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        message += `• ${item.name || 'Товар'} x ${item.quantity} = ${item.total} ₸\n`;
      }
    } else {
      message += `• Информация о товарах отсутствует\n`;
    }
    
    message += `\n📅 *Дата*: ${new Date().toLocaleString('ru-RU')}\n`;

    // Создаем кнопки для управления заказом (без кнопки "Заказ создан")
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Показать детали', callback_data: `view:${order.id}:details` }
        ],
        [
          { text: 'В сборку', callback_data: `status:${order.id}:1` },
          { text: 'Отправить', callback_data: `status:${order.id}:2` }
        ],
        [
          { text: 'Доставлен', callback_data: `status:${order.id}:3` },
          { text: 'Отменить', callback_data: `status:${order.id}:4` }
        ]
      ]
    };

    // Отправляем сообщение с кнопками
    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    console.log('Уведомление о заказе отправлено в Telegram');
  } catch (error) {
    console.error('Ошибка отправки уведомления в Telegram:', error.message);
  }
};

// Экспортируем бот для использования в других модулях
export { bot };

export default {
  sendOrderNotification
};