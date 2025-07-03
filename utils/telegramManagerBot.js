import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import knex from '#models/knex.js';
import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import * as User from '#models/user.js';
import * as Supplier from '#models/supplier.js';
import * as telegramAuth from './telegramAuth.js';
import { sendStatusUpdateNotification } from './telegramNotifier.js';

dotenv.config();

// Получаем токен из переменных окружения для бота менеджера
const token = process.env.TELEGRAM_MANAGER_BOT_TOKEN;
const chatId = process.env.TELEGRAM_MANAGER_CHAT_ID;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || chatId;

// Статусы заказов
const ORDER_STATUSES = {
  0: 'Заказ создан',
  1: 'В сборке',
  2: 'Готов к отправке',
  3: 'В пути',
  4: 'Доставлен',
  5: 'Отменен'
};

// Создаем экземпляр бота с включенным polling для обработки команд
let bot;

try {
  if (token) {
    bot = new TelegramBot(token, { polling: true });
    setupBotCommands();
  }
} catch (error) {
  console.error('Ошибка инициализации Telegram бота для менеджеров:', error.message);
}

/**
 * Настраивает команды и обработчики событий бота
 */
function setupBotCommands() {
  if (!bot) return;

  // Обработка команды /start - начало работы с ботом
  bot.onText(/\/start/, async (msg) => {
    const userId = msg.chat.id;
    
    // Сначала пробуем автоматически авторизовать пользователя по его Telegram ID
    try {
      const session = await telegramAuth.autoAuthByTelegramId(userId);
      
      if (session && session.role === 'admin') {
        // Если автоматическая авторизация успешна для менеджера
        const userName = session.user.name || session.user.login || '';
        
        bot.sendMessage(userId, `Добро пожаловать, ${userName}! Вы автоматически авторизованы как менеджер.`);
        sendAdminMainMenu(userId, 'Панель менеджера:');
        return;
      } else if (session && session.role === 'client') {
        // Если это клиент, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как клиент. Пожалуйста, используйте бота для клиентов.');
        telegramAuth.logout(userId);
        return;
      }
    } catch (error) {
      console.error('Ошибка при автоматической авторизации:', error);
    }
    
    // Если автоматическая авторизация не удалась, проверяем обычную авторизацию
    if (telegramAuth.isAuthenticated(userId)) {
      const role = telegramAuth.getUserRole(userId);
      if (role === 'admin') {
        sendAdminMainMenu(userId, 'Добро пожаловать в панель менеджера!');
      } else {
        // Если это клиент, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как клиент. Пожалуйста, используйте бота для клиентов.');
        telegramAuth.logout(userId);
      }
    } else {
      sendAuthMenu(userId, 'Добро пожаловать в систему управления заказами! Для начала работы необходимо авторизоваться:');
    }
  });

  // Обработка команды /help
  bot.onText(/\/help/, (msg) => {
    const userId = msg.chat.id;
    let helpText = 'Доступные команды для менеджера:\n\n';
    helpText += '/start - Открыть главное меню\n';
    helpText += '/help - Показать список команд\n';
    helpText += '/menu - Открыть главное меню\n';
    helpText += '/orders - Показать все заказы\n';
    helpText += '/status {id} - Показать статус заказа по ID\n';
    helpText += '/logout - Выйти из аккаунта\n';
    
    bot.sendMessage(userId, helpText);
  });

  // Обработка команды /menu
  bot.onText(/\/menu/, (msg) => {
    const userId = msg.chat.id;
    if (telegramAuth.isAuthenticated(userId)) {
      const role = telegramAuth.getUserRole(userId);
      if (role === 'admin') {
        sendAdminMainMenu(userId, 'Панель менеджера:');
      } else {
        // Если это клиент, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как клиент. Пожалуйста, используйте бота для клиентов.');
        telegramAuth.logout(userId);
      }
    } else {
      sendAuthMenu(userId, 'Для начала работы необходимо авторизоваться:');
    }
  });

  // Обработка команды /logout - выход из аккаунта
  bot.onText(/\/logout/, (msg) => {
    const userId = msg.chat.id;
    telegramAuth.logout(userId);
    bot.sendMessage(userId, 'Вы успешно вышли из аккаунта.');
    sendAuthMenu(userId, 'Для продолжения работы необходимо авторизоваться:');
  });

  // Обработка ввода пользователя для авторизации
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const userId = msg.chat.id;
    const session = telegramAuth.getSession(userId);
    
    // Если пользователь не в процессе авторизации, игнорируем сообщение
    if (!session || !session.authState) return;
    
          // Обработка авторизации администратора
      if (session.authState === 'awaiting_admin_login') {
        // Сохраняем логин и запрашиваем пароль
        session.login = msg.text;
        session.authState = 'awaiting_admin_password';
        
        bot.sendMessage(userId, 'Введите пароль менеджера:');
      } else if (session.authState === 'awaiting_admin_password') {
        // Получаем пароль и пытаемся авторизоваться как менеджер
        const password = msg.text;
        const login = session.login;
        
        const authData = await telegramAuth.authAdmin(login, password);
      
      // Удаляем временные данные авторизации
      delete session.authState;
      delete session.login;
      
      if (authData) {
        // Создаем сессию администратора
        telegramAuth.createSession(userId, authData);
        
        // Сохраняем telegram_id в базе данных
        try {
          await User.update(authData.user.id, { 
            telegram_id: String(userId)
          });
        } catch (error) {
          console.error('Ошибка обновления telegram_id менеджера:', error);
        }
        
        bot.sendMessage(userId, 'Авторизация менеджера успешна!');
        sendAdminMainMenu(userId, 'Добро пожаловать в панель менеджера!');
      } else {
        bot.sendMessage(userId, 'Ошибка авторизации. Неверный логин или пароль менеджера.');
        sendAuthMenu(userId, 'Попробуйте снова:');
      }
    } else if (session.authState === 'awaiting_phone') {
      // Сообщаем, что для клиентов есть другой бот
      bot.sendMessage(userId, 'Этот бот предназначен только для менеджеров. Для клиентов используйте другого бота.');
      delete session.authState;
    }
  });
  
  // Обработка callback запросов от кнопок меню
  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const msg = callbackQuery.message;
    const userId = msg.chat.id;
    
    // Формат данных: action:id:value
    const [action, id, value] = data.split(':');
    
    try {
      // Авторизация
      if (action === 'auth') {
        if (id === 'admin') {
          // Инициируем процесс авторизации администратора
          telegramAuth.startAdminAuthProcess(userId);
          
          bot.sendMessage(userId, 'Введите логин менеджера:');
          bot.answerCallbackQuery(callbackQuery.id);
        } else if (id === 'client') {
          // Сообщаем, что для клиентов есть другой бот
          bot.sendMessage(userId, 'Этот бот предназначен только для менеджеров. Для авторизации как клиент используйте бота для клиентов.');
          bot.answerCallbackQuery(callbackQuery.id);
        }
        return;
      }
      
      // Выход из аккаунта
      if (action === 'logout') {
        telegramAuth.logout(userId);
        bot.sendMessage(userId, 'Вы успешно вышли из аккаунта.');
        sendAuthMenu(userId, 'Для продолжения работы необходимо авторизоваться:');
        bot.answerCallbackQuery(callbackQuery.id);
        return;
      }
      
      // Проверяем авторизацию для всех остальных действий
      if (!telegramAuth.isAuthenticated(userId)) {
        bot.sendMessage(userId, 'Для использования этой функции необходимо авторизоваться.');
        sendAuthMenu(userId, 'Выберите способ авторизации:');
        bot.answerCallbackQuery(callbackQuery.id);
        return;
      }
      
      const role = telegramAuth.getUserRole(userId);
      
      // Обрабатываем действия администратора
      if (role === 'admin') {
        await handleAdminActions(action, id, value, userId, callbackQuery);
      } else {
        // Если это клиент, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как клиент. Пожалуйста, используйте бота для клиентов.');
        telegramAuth.logout(userId);
        bot.answerCallbackQuery(callbackQuery.id);
      }
      
    } catch (error) {
      console.error('Ошибка обработки запроса:', error);
      bot.sendMessage(userId, `Произошла ошибка: ${error.message}`);
      bot.answerCallbackQuery(callbackQuery.id);
    }
  });
}

/**
 * Отправляет меню авторизации
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение для пользователя
 */
async function sendAuthMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Зайти', callback_data: 'auth:admin' }]
    ]
  };
  
  bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет главное меню менеджера
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение для пользователя
 */
async function sendAdminMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '📋 Все заказы', callback_data: 'admin:orders' }],
      [{ text: '🔍 Фильтр по статусу', callback_data: 'admin:filter' }],
      [{ text: '📊 Статистика', callback_data: 'admin:stats' }],
      [{ text: '🚪 Выйти из аккаунта', callback_data: 'logout' }]
    ]
  };
  
  bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет уведомление о новом заказе
 * @param {Object} order - Объект заказа
 * @param {Array} items - Массив товаров в заказе
 */
export const sendOrderNotification = async (order, items) => {
  if (!bot) {
    console.error('Telegram бот для менеджеров не настроен. Проверьте переменную окружения TELEGRAM_MANAGER_BOT_TOKEN');
    return;
  }

  try {
    // Формируем детальное сообщение о заказе
    const detailedMessage = await getOrderDetails(order, items);

    // Создаем кнопки для управления заказом для менеджера
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
          { text: 'Доставлен', callback_data: `status:${order.id}:4` },
          { text: 'Отменить', callback_data: `status:${order.id}:5` }
        ]
      ]
    };

    // Получаем всех менеджеров, которые когда-либо заходили в бот
    const db = knex();
    const managers = await db('user')
      .where({ role: 'manager', deleted_at: null })
      .whereNotNull('telegram_id')
      .select('telegram_id');

    if (managers && managers.length > 0) {
      // Отправляем уведомления всем активным менеджерам
      for (const manager of managers) {
        try {
          if (manager.telegram_id) {
            await bot.sendMessage(manager.telegram_id, detailedMessage, { 
              parse_mode: 'Markdown',
              reply_markup: keyboard
            });
          }
        } catch (err) {
          console.error(`Ошибка отправки уведомления менеджеру:`, err.message);
        }
      }
    } else {
      // Если нет активных менеджеров, отправляем в общий чат (если он указан)
      if (chatId) {
        await bot.sendMessage(chatId, detailedMessage, { 
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      }
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления в Telegram:', error.message);
  }
};

/**
 * Получает детальную информацию о заказе для отправки уведомления
 * @param {Object} order - Объект заказа
 * @param {Array} items - Товары в заказе
 * @returns {string} - Форматированное сообщение
 */
async function getOrderDetails(order, items) {
  let message = `📦 *НОВЫЙ ЗАКАЗ #${order.id}*\n\n`;
  
  // Получаем информацию о пользователе
  let userInfo = 'Неизвестный пользователь';
  try {
    const user = await User.find(order.user_id);
    if (user) {
      userInfo = `${user.name || 'Клиент'}\n`;
      userInfo += `📱 Телефон: ${user.phone || 'Не указан'}\n`;
      userInfo += `📧 Email: ${user.email || 'Не указан'}\n`;
      userInfo += `🏠 Адрес: ${user.address || 'Не указан'}\n`;
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
  }
  
  message += `👤 *Клиент:* ${userInfo}\n`;
  message += `📅 *Дата:* ${new Date(parseInt(order.created_at)).toLocaleString()}\n\n`;
  
  message += '*Товары:*\n';
  
  // Если нет предварительно загруженных товаров, пробуем загрузить их из БД
  if (!items || items.length === 0) {
    try {
      const orderItems = await OrderItem.getByOrderId(order.id);
      items = [];
      
      for (const item of orderItems) {
        const product = await Product.find(item.product_id);
        if (product) {
          items.push({
            name: product.title || product.name || 'Товар',
            quantity: item.quantity,
            total: item.total
          });
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
    }
  }
  
  // Добавляем информацию о товарах
  if (items && items.length > 0) {
    for (const item of items) {
      message += `- ${item.name}, ${item.quantity} шт. - ${item.total} ₸\n`;
    }
  } else {
    message += 'Информация о товарах недоступна\n';
  }
  
  message += `\n*Итого: ${order.total} ₸*`;
  
  return message;
}

/**
 * Обрабатывает действия администратора
 * @param {string} action - Тип действия
 * @param {string} id - Идентификатор элемента
 * @param {string} value - Дополнительное значение
 * @param {number} userId - ID пользователя
 * @param {Object} callbackQuery - Объект callback запроса
 */
async function handleAdminActions(action, id, value, userId, callbackQuery) {
  switch (action) {
    case 'admin':
      if (id === 'orders') {
        // Показать все заказы
        await showAllOrders(userId);
      } else if (id === 'filter') {
        // Показать меню фильтрации
        await sendFilterMenu(userId);
      } else if (id === 'stats') {
        // Показать статистику
        bot.sendMessage(userId, 'Функция статистики заказов будет доступна в ближайшее время.');
      } else if (id === 'back_to_menu') {
        // Вернуться в главное меню
        sendAdminMainMenu(userId, 'Главное меню менеджера:');
      }
      break;
      
    case 'filter':
      // Фильтрация заказов по статусу
      await filterOrdersByStatus(userId, parseInt(id));
      break;
      
    case 'status':
      // Изменение статуса заказа
      try {
        const orderId = id;
        const newStatus = parseInt(value);
        
        // Обновляем статус заказа
        await Order.update(orderId, { status: newStatus });
        
        // Получаем обновленный заказ
        const updatedOrder = await Order.find(orderId);
        
        // Отправляем уведомление об успешном обновлении
        bot.sendMessage(userId, `Статус заказа #${orderId} изменен на "${ORDER_STATUSES[newStatus]}"`);
        
        // Отправляем обновленную информацию о заказе
        const items = await OrderItem.getByOrderId(orderId);
        
        // Отправляем детальную информацию с кнопками изменения статуса
        await sendOrderWithStatusButtons(userId, updatedOrder);
        
        // Уведомляем клиента об изменении статуса с использованием новой функции
        try {
          await sendStatusUpdateNotification(updatedOrder);
        } catch (error) {
          console.error('Ошибка при отправке уведомления клиенту:', error);
        }
        
      } catch (error) {
        console.error('Ошибка при изменении статуса заказа:', error);
        bot.sendMessage(userId, 'Произошла ошибка при изменении статуса заказа.');
      }
      break;
      
    case 'view':
      // Просмотр деталей заказа
      try {
        const order = await Order.find(id);
        if (!order) {
          bot.sendMessage(userId, 'Заказ не найден.');
          return;
        }
        
        await sendOrderWithStatusButtons(userId, order);
      } catch (error) {
        console.error('Ошибка при получении информации о заказе:', error);
        bot.sendMessage(userId, 'Произошла ошибка при получении информации о заказе.');
      }
      break;
  }
  
  bot.answerCallbackQuery(callbackQuery.id);
}

/**
 * Отправляет меню фильтрации заказов по статусу
 * @param {number} chatId - ID чата
 */
async function sendFilterMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: ORDER_STATUSES[0], callback_data: `filter:0` },
        { text: ORDER_STATUSES[1], callback_data: `filter:1` }
      ],
      [
        { text: ORDER_STATUSES[2], callback_data: `filter:2` },
        { text: ORDER_STATUSES[4], callback_data: `filter:4` }
      ],
      [
        { text: ORDER_STATUSES[5], callback_data: `filter:5` }
      ],
      [
        { text: 'Вернуться в меню', callback_data: 'admin:back_to_menu' }
      ]
    ]
  };
  
  bot.sendMessage(chatId, 'Выберите статус для фильтрации заказов:', {
    reply_markup: keyboard
  });
}

/**
 * Показывает все заказы
 * @param {number} chatId - ID чата
 */
async function showAllOrders(chatId) {
  try {
    // Получаем все заказы
    const orders = await Order.getWhere({ deleted_at: null });
    
    if (!orders || orders.length === 0) {
      bot.sendMessage(chatId, 'Заказы не найдены', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в меню', callback_data: 'admin:back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    // Формируем сообщение со списком заказов
    let message = '*Список всех заказов:*\n\n';
    
    // Создаем кнопки для каждого заказа
    const keyboard = {
      inline_keyboard: []
    };
    
    for (const order of orders) {
      const date = new Date(parseInt(order.created_at));
      const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
      
      message += `📦 *Заказ #${order.id}* (${formattedDate})\n`;
      message += `Статус: ${ORDER_STATUSES[order.status] || 'Неизвестный статус'}\n`;
      message += `Сумма: ${order.total} ₸\n\n`;
      
      keyboard.inline_keyboard.push([
        { text: `Детали заказа #${order.id}`, callback_data: `view:${order.id}:details` }
      ]);
    }
    
    // Добавляем кнопку возврата в меню
    keyboard.inline_keyboard.push([
      { text: 'Вернуться в меню', callback_data: 'admin:back_to_menu' }
    ]);
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при получении списка заказов:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при получении списка заказов.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Вернуться в меню', callback_data: 'admin:back_to_menu' }]
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
      bot.sendMessage(chatId, `Заказы со статусом "${ORDER_STATUSES[statusCode]}" не найдены`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'К фильтрам', callback_data: 'admin:filter' }],
            [{ text: 'В главное меню', callback_data: 'admin:back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    // Формируем сообщение со списком отфильтрованных заказов
    let message = `*Заказы со статусом "${ORDER_STATUSES[statusCode]}":*\n\n`;
    
    // Создаем кнопки для каждого заказа
    const keyboard = {
      inline_keyboard: []
    };
    
    for (const order of orders) {
      const date = new Date(parseInt(order.created_at));
      const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
      
      message += `📦 *Заказ #${order.id}* (${formattedDate})\n`;
      message += `Сумма: ${order.total} ₸\n\n`;
      
      keyboard.inline_keyboard.push([
        { text: `Детали заказа #${order.id}`, callback_data: `view:${order.id}:details` }
      ]);
    }
    
    // Добавляем кнопки навигации
    keyboard.inline_keyboard.push([
      { text: 'К фильтрам', callback_data: 'admin:filter' }
    ]);
    keyboard.inline_keyboard.push([
      { text: 'В главное меню', callback_data: 'admin:back_to_menu' }
    ]);
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при фильтрации заказов:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при фильтрации заказов.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'В главное меню', callback_data: 'admin:back_to_menu' }]
        ]
      }
    });
  }
}

/**
 * Отправляет информацию о заказе с кнопками для изменения статуса
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function sendOrderWithStatusButtons(chatId, order) {
  try {
    // Получаем товары в заказе
    const items = await OrderItem.getByOrderId(order.id);
    
    // Получаем информацию о клиенте
    let userInfo = 'Неизвестный клиент';
    try {
      const user = await User.find(order.user_id);
      if (user) {
        userInfo = `${user.name || 'Клиент'}\n`;
        userInfo += `📱 Телефон: ${user.phone || 'Не указан'}\n`;
        userInfo += `📧 Email: ${user.email || 'Не указан'}\n`;
        userInfo += `🏠 Адрес: ${user.address || 'Не указан'}\n`;
      }
    } catch (error) {
      console.error('Ошибка при получении данных клиента:', error);
    }
    
    let message = `📦 *Детали заказа #${order.id}*\n\n`;
    message += `Статус: ${ORDER_STATUSES[order.status] || 'Неизвестный статус'}\n\n`;
    message += `👤 *Клиент:* ${userInfo}\n`;
    
    const date = new Date(parseInt(order.created_at));
    const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
    message += `📅 *Дата заказа:* ${formattedDate}\n\n`;
    
    message += '*Товары:*\n';
    
    let totalSum = 0;
    
    // Показываем товары в заказе
    if (items && items.length > 0) {
      for (const item of items) {
        try {
          const product = await Product.find(item.product_id);
          const productName = product ? (product.title || product.name || 'Товар') : 'Товар';
          message += `- ${productName}, ${item.quantity} шт. - ${item.total} ₸\n`;
          totalSum += parseFloat(item.total);
        } catch (error) {
          console.error('Ошибка при получении информации о товаре:', error);
        }
      }
    } else {
      message += 'Информация о товарах недоступна\n';
      totalSum = parseFloat(order.total || 0);
    }
    
    message += `\n*Итого: ${totalSum.toFixed(2)} ₸*\n`;
    
    // Создаем кнопки для изменения статуса заказа
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'В сборку', callback_data: `status:${order.id}:1` },
          { text: 'Готов к отправке', callback_data: `status:${order.id}:2` }
        ],
        [
          { text: 'В пути', callback_data: `status:${order.id}:3` },
          { text: 'Доставлен', callback_data: `status:${order.id}:4` }
        ],
        [
          { text: 'Отменить заказ', callback_data: `status:${order.id}:5` }
        ],
        [
          { text: 'К списку заказов', callback_data: 'admin:orders' },
          { text: 'В главное меню', callback_data: 'admin:back_to_menu' }
        ]
      ]
    };
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при отправке деталей заказа:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при получении деталей заказа.');
  }
}

export { bot }; 