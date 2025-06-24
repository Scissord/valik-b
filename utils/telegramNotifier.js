import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import * as User from '#models/user.js';
import * as Supplier from '#models/supplier.js';
import * as telegramAuth from './telegramAuth.js';

dotenv.config();

// Получаем токен из переменных окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
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
  console.error('Ошибка инициализации Telegram бота:', error.message);
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
      
      if (session) {
        // Если автоматическая авторизация успешна
        const role = session.role;
        
        bot.sendMessage(userId, `Добро пожаловать! Вы автоматически авторизованы как ${role === 'client' ? 'клиент' : 'поставщик'}.`);
        
        switch (role) {
          case 'client':
            sendClientMainMenu(userId, 'Меню клиента:');
            break;
          case 'supplier':
            sendSupplierMainMenu(userId, 'Меню поставщика:');
            break;
          case 'admin':
            sendAdminMainMenu(userId, 'Панель администратора:');
            break;
          default:
            sendAuthMenu(userId, 'Выберите действие:');
        }
        return;
      }
    } catch (error) {
      console.error('Ошибка при автоматической авторизации:', error);
    }
    
    // Если автоматическая авторизация не удалась, проверяем обычную авторизацию
    if (telegramAuth.isAuthenticated(userId)) {
      const role = telegramAuth.getUserRole(userId);
      switch (role) {
        case 'client':
          sendClientMainMenu(userId, 'Добро пожаловать в меню клиента!');
          break;
        case 'supplier':
          sendSupplierMainMenu(userId, 'Добро пожаловать в меню поставщика!');
          break;
        case 'admin':
          sendAdminMainMenu(userId, 'Добро пожаловать в панель администратора!');
          break;
        default:
          sendAuthMenu(userId, 'Добро пожаловать! Выберите действие:');
      }
    } else {
      sendAuthMenu(userId, 'Добро пожаловать! Для начала работы необходимо авторизоваться:');
    }
  });

  // Обработка команды /help
  bot.onText(/\/help/, (msg) => {
    const userId = msg.chat.id;
    let helpText = 'Доступные команды:\n\n';
    helpText += '/start - Открыть главное меню\n';
    helpText += '/help - Показать список команд\n';
    helpText += '/menu - Открыть главное меню\n';
    helpText += '/logout - Выйти из аккаунта\n';
    
    bot.sendMessage(userId, helpText);
  });

  // Обработка команды /menu - показываем главное меню в зависимости от роли
  bot.onText(/\/menu/, (msg) => {
    const userId = msg.chat.id;
    if (telegramAuth.isAuthenticated(userId)) {
      const role = telegramAuth.getUserRole(userId);
      switch (role) {
        case 'client':
          sendClientMainMenu(userId, 'Меню клиента:');
          break;
        case 'supplier':
          sendSupplierMainMenu(userId, 'Меню поставщика:');
          break;
        case 'admin':
          sendAdminMainMenu(userId, 'Панель администратора:');
          break;
        default:
          sendAuthMenu(userId, 'Выберите действие:');
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

  // Обработка ввода логина
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const userId = msg.chat.id;
    const session = telegramAuth.getSession(userId);
    
    // Если пользователь не в процессе авторизации, игнорируем сообщение
    if (!session || !session.authState) return;
    
    // Обработка ввода логина и пароля
    if (session.authState === 'awaiting_login') {
      // Сохраняем логин и запрашиваем пароль
      session.login = msg.text;
      session.authState = 'awaiting_password';
      
      bot.sendMessage(userId, 'Введите пароль:');
    } else if (session.authState === 'awaiting_password') {
      // Получаем пароль и пытаемся авторизоваться
      const password = msg.text;
      const login = session.login;
      
      let authData = null;
      
      // Пытаемся авторизоваться в зависимости от выбранной роли
      if (session.authRole === 'client') {
        authData = await telegramAuth.authClient(login, password);
      } else if (session.authRole === 'supplier') {
        authData = await telegramAuth.authSupplier(login, password);
      }
      
      // Удаляем временные данные авторизации
      delete session.authState;
      delete session.login;
      
      if (authData) {
        // Сохраняем telegram_id пользователя в базе данных
        if (authData.role === 'client') {
          try {
            await User.update(authData.user.id, { 
              telegram_id: String(userId),
              telegram_data: JSON.stringify(msg.from)
            });
          } catch (error) {
            console.error('Ошибка обновления telegram_id пользователя:', error);
          }
        } else if (authData.role === 'supplier') {
          try {
            await Supplier.update(authData.user.id, {
              telegram_id: String(userId),
              telegram_data: JSON.stringify(msg.from)
            });
          } catch (error) {
            console.error('Ошибка обновления telegram_id поставщика:', error);
          }
        }
        
        // Создаем сессию пользователя
        telegramAuth.createSession(userId, authData);
        
        bot.sendMessage(userId, 'Авторизация успешна!');
        
        // Показываем соответствующее меню
        if (authData.role === 'client') {
          sendClientMainMenu(userId, 'Добро пожаловать в меню клиента!');
        } else if (authData.role === 'supplier') {
          sendSupplierMainMenu(userId, 'Добро пожаловать в меню поставщика!');
        }
      } else {
        bot.sendMessage(userId, 'Ошибка авторизации. Неверный логин или пароль.');
        sendAuthMenu(userId, 'Попробуйте снова:');
      }
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
        if (id === 'client' || id === 'supplier') {
          // Инициируем процесс авторизации
          telegramAuth.startAuthProcess(userId, id);
          
          bot.sendMessage(userId, 'Введите логин:');
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
        // Пытаемся автоматически авторизоваться
        const session = await telegramAuth.autoAuthByTelegramId(userId);
        
        if (!session) {
          bot.sendMessage(userId, 'Для использования бота необходимо авторизоваться.');
          sendAuthMenu(userId, 'Выберите тип авторизации:');
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        }
      }
      
      const userRole = telegramAuth.getUserRole(userId);

      // Маршрутизация действий по ролям
      if (userRole === 'client') {
        await handleClientActions(action, id, value, userId, callbackQuery);
      } else if (userRole === 'supplier') {
        await handleSupplierActions(action, id, value, userId, callbackQuery);
      } else if (userRole === 'admin') {
        await handleAdminActions(action, id, value, userId, callbackQuery);
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
  if (!bot) {
    console.log('Telegram бот не настроен. Проверьте переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID');
    return;
  }

  try {
    // Получаем информацию о пользователе
    let userName = 'Не указан';
    let userPhone = 'Не указан';
    let userTelegramId = null;
    
    if (order.user_id) {
      try {
        const user = await User.find(order.user_id);
        if (user) {
          userName = user.name || user.login || 'Не указан';
          userPhone = user.phone || 'Не указан';
          userTelegramId = user.telegram_id || null;
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    }

    // Формируем текст сообщения для администратора
    let adminMessage = `🔔 *НОВЫЙ ЗАКАЗ #${order.id}*\n\n`;
    adminMessage += `👤 *Клиент*: ${userName}\n`;
    adminMessage += `📱 *Телефон*: ${userPhone}\n`;
    adminMessage += `💰 *Сумма*: ${order.total || 0} ₸\n\n`;
    
    // Добавляем информацию о товарах
    adminMessage += `📋 *Товары*:\n`;
    
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        adminMessage += `• ${item.name || 'Товар'} x ${item.quantity} = ${item.total} ₸\n`;
      }
    } else {
      adminMessage += `• Информация о товарах отсутствует\n`;
    }
    
    adminMessage += `\n📅 *Дата*: ${new Date().toLocaleString('ru-RU')}\n`;

    // Создаем кнопки для управления заказом для администратора
    const adminKeyboard = {
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

    // Отправляем сообщение администратору
    await bot.sendMessage(chatId, adminMessage, { 
      parse_mode: 'Markdown',
      reply_markup: adminKeyboard
    });
    console.log('Уведомление о заказе отправлено администратору');
    
    // Если у пользователя есть telegram_id, отправляем ему уведомление
    if (userTelegramId) {
      // Формируем текст сообщения для клиента
      let clientMessage = `🎉 *Ваш заказ #${order.id} успешно создан!*\n\n`;
      clientMessage += `💰 *Сумма*: ${order.total || 0} ₸\n\n`;
      
      // Добавляем информацию о товарах
      clientMessage += `📋 *Товары*:\n`;
      
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          clientMessage += `• ${item.name || 'Товар'} x ${item.quantity} = ${item.total} ₸\n`;
        }
      } else {
        clientMessage += `• Информация о товарах отсутствует\n`;
      }
      
      clientMessage += `\n📅 *Дата*: ${new Date().toLocaleString('ru-RU')}\n`;
      clientMessage += `\nВы будете получать уведомления о статусе вашего заказа.\n`;

      // Создаем кнопки для клиента
      const clientKeyboard = {
        inline_keyboard: [
          [
            { text: '📋 Детали заказа', callback_data: `order:view:${order.id}` }
          ],
          [
            { text: '📦 Все мои заказы', callback_data: 'client:orders:' }
          ]
        ]
      };

      // Отправляем сообщение клиенту
      await bot.sendMessage(userTelegramId, clientMessage, { 
        parse_mode: 'Markdown',
        reply_markup: clientKeyboard
      });
      console.log(`Уведомление о заказе отправлено клиенту (Telegram ID: ${userTelegramId})`);
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления в Telegram:', error.message);
  }
};

/**
 * Отправляет меню авторизации
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение над меню
 */
async function sendAuthMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '👤 Войти как клиент', callback_data: 'auth:client:' }],
      [{ text: '🏪 Войти как поставщик', callback_data: 'auth:supplier:' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет главное меню клиента
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение над меню
 */
async function sendClientMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '📋 Мои заказы', callback_data: 'client:orders:' }],
      [{ text: '📱 Настройки профиля', callback_data: 'client:profile:' }],
      [{ text: '❓ Помощь', callback_data: 'client:help:' }],
      [{ text: '🚪 Выйти из аккаунта', callback_data: 'logout::' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет главное меню поставщика
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение над меню
 */
async function sendSupplierMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '📦 Активные заказы', callback_data: 'supplier:active_orders:' }],
      [{ text: '📊 История заказов', callback_data: 'supplier:order_history:' }],
      [{ text: '⚙️ Настройки', callback_data: 'supplier:settings:' }],
      [{ text: '🚪 Выйти из аккаунта', callback_data: 'logout::' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет главное меню администратора
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение над меню
 */
async function sendAdminMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '📋 Все заказы', callback_data: 'admin:orders:' }],
      [{ text: '🔍 Фильтр заказов по статусу', callback_data: 'admin:filter:' }],
      [{ text: '⚠️ Уведомления', callback_data: 'admin:notifications:' }],
      [{ text: '🚪 Выйти из аккаунта', callback_data: 'logout::' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Обрабатывает действия клиента
 * @param {string} action - Тип действия
 * @param {string} id - Идентификатор элемента
 * @param {string} value - Дополнительное значение
 * @param {number} userId - ID пользователя
 * @param {Object} callbackQuery - Объект callback запроса
 */
async function handleClientActions(action, id, value, userId, callbackQuery) {
  const session = telegramAuth.getSession(userId);
  
  switch (action) {
    case 'client':
      if (id === 'orders') {
        // Показать заказы клиента
        await showClientOrders(userId, session.user.id);
      } else if (id === 'profile') {
        // Показать профиль клиента
        await showClientProfile(userId, session.user);
      } else if (id === 'help') {
        // Показать помощь для клиента
        await bot.sendMessage(userId, 'Здесь будет отображаться справочная информация для клиентов.');
      } else if (id === 'back') {
        // Вернуться в главное меню клиента
        await sendClientMainMenu(userId, 'Меню клиента:');
      }
      break;
      
    case 'order':
      if (id === 'view') {
        // Просмотр деталей заказа клиента
        const order = await Order.find(value);
        if (!order || order.user_id !== session.user.id) {
          bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не принадлежит вам' });
          return;
        }
        
        await showClientOrderDetails(userId, order);
      } else if (id === 'request_delivery') {
        // Запрос быстрой доставки
        const order = await Order.find(value);
        if (!order || order.user_id !== session.user.id) {
          bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не принадлежит вам' });
          return;
        }
        
        if (order.status !== 2) { // Проверяем, готов ли заказ к отправке
          bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ еще не готов к отправке' });
          return;
        }
        
        await showDeliveryOptions(userId, order);
      }
      break;
      
    case 'delivery':
      // Выбор опции доставки
      const order = await Order.find(id);
      if (!order || order.user_id !== session.user.id) {
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не принадлежит вам' });
        return;
      }
      
      // Обновляем информацию о доставке
      await Order.update(id, { 
        delivery_options: value,
        status: 3 // Меняем статус на "В пути"
      });
      
      bot.sendMessage(userId, `Выбрана опция доставки: ${value}. Ваш заказ скоро будет отправлен!`);
      
      // Отправляем уведомление поставщику
      const supplier = await Supplier.find(order.supplier_id);
      if (supplier && supplier.telegram_id) {
        bot.sendMessage(supplier.telegram_id, `🚚 Клиент выбрал опцию доставки для заказа #${order.id}: ${value}`);
      }
      
      // Отправляем уведомление администратору
      bot.sendMessage(adminChatId, `🚚 Клиент выбрал опцию доставки для заказа #${order.id}: ${value}`);
      
      // Показываем обновленные детали заказа
      await showClientOrderDetails(userId, await Order.find(id));
      break;
  }
  
  bot.answerCallbackQuery(callbackQuery.id);
}

/**
 * Обрабатывает действия поставщика
 * @param {string} action - Тип действия
 * @param {string} id - Идентификатор элемента
 * @param {string} value - Дополнительное значение
 * @param {number} userId - ID пользователя
 * @param {Object} callbackQuery - Объект callback запроса
 */
async function handleSupplierActions(action, id, value, userId, callbackQuery) {
  const session = telegramAuth.getSession(userId);
  
  switch (action) {
    case 'supplier':
      if (id === 'active_orders') {
        // Показать активные заказы поставщика
        await showSupplierActiveOrders(userId, session.user.id);
      } else if (id === 'order_history') {
        // Показать историю заказов
        await showSupplierOrderHistory(userId, session.user.id);
      } else if (id === 'settings') {
        // Показать настройки поставщика
        await bot.sendMessage(userId, 'Здесь будут отображаться настройки поставщика.');
      } else if (id === 'back') {
        // Вернуться в главное меню поставщика
        await sendSupplierMainMenu(userId, 'Меню поставщика:');
      }
      break;
      
    case 'order':
      if (id === 'view') {
        // Просмотр деталей заказа поставщиком
        const order = await Order.find(value);
        if (!order || order.supplier_id !== session.user.id) {
          bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не назначен вам' });
          return;
        }
        
        await showSupplierOrderDetails(userId, order);
      } else if (id === 'status') {
        // Изменение статуса заказа
        const order = await Order.find(value);
        if (!order || order.supplier_id !== session.user.id) {
          bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не назначен вам' });
          return;
        }
        
        await showOrderStatusOptions(userId, order);
      }
      break;
      
    case 'status':
      // Обновление статуса заказа
      const orderId = id;
      const newStatus = parseInt(value);
      
      const order = await Order.find(orderId);
      if (!order || order.supplier_id !== session.user.id) {
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не назначен вам' });
        return;
      }
      
      // Дополнительные данные при смене статуса
      let additionalData = {};
      
      // Если заказ отмечен как "Готов к отправке", добавляем время готовности
      if (newStatus === 2) {
        additionalData.ready_time = Date.now();
        
        // Показываем опции времени ожидания
        await showWaitingTimeOptions(userId, order);
      }
      
      // Обновляем статус заказа
      await Order.update(orderId, { 
        status: newStatus,
        ...additionalData
      });
      
      // Отправляем уведомление клиенту
      if (order.user_id) {
        const user = await User.find(order.user_id);
        if (user && user.telegram_id) {
          bot.sendMessage(user.telegram_id, `Статус вашего заказа #${orderId} изменен на "${ORDER_STATUSES[newStatus]}"`);
          
          // Если заказ готов к отправке, предлагаем клиенту опции доставки
          if (newStatus === 2) {
            const buttons = {
              inline_keyboard: [
                [{ text: '🚚 Заказать доставку', callback_data: `order:request_delivery:${orderId}` }],
                [{ text: '📋 Детали заказа', callback_data: `order:view:${orderId}` }]
              ]
            };
            
            bot.sendMessage(user.telegram_id, 'Ваш заказ готов к отправке! Вы можете заказать доставку:', {
              reply_markup: buttons
            });
          }
        }
      }
      
      // Отправляем уведомление администратору
      bot.sendMessage(adminChatId, `Поставщик изменил статус заказа #${orderId} на "${ORDER_STATUSES[newStatus]}"`);
      
      // Отвечаем на callback запрос
      bot.answerCallbackQuery(callbackQuery.id, { text: `Статус заказа #${orderId} обновлен на "${ORDER_STATUSES[newStatus]}"` });
      
      // Показываем обновленные детали заказа
      await showSupplierOrderDetails(userId, await Order.find(orderId));
      break;
      
    case 'waiting':
      // Обновление времени ожидания готовности
      const waitingOrder = await Order.find(id);
      if (!waitingOrder || waitingOrder.supplier_id !== session.user.id) {
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Заказ не найден или не назначен вам' });
        return;
      }
      
      // Обновляем информацию о времени ожидания
      await Order.update(id, { 
        delivery_options: `Время ожидания: ${value} минут`
      });
      
      bot.sendMessage(userId, `Установлено время ожидания для заказа #${id}: ${value} минут`);
      
      // Отправляем уведомление клиенту
      if (waitingOrder.user_id) {
        const user = await User.find(waitingOrder.user_id);
        if (user && user.telegram_id) {
          bot.sendMessage(user.telegram_id, `Поставщик указал время ожидания для вашего заказа #${id}: ${value} минут`);
        }
      }
      
      // Отправляем уведомление администратору
      bot.sendMessage(adminChatId, `Поставщик указал время ожидания для заказа #${id}: ${value} минут`);
      
      bot.answerCallbackQuery(callbackQuery.id);
      break;
  }
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
  // Проверяем, что пользователь является администратором
  if (userId != adminChatId) {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'У вас нет прав администратора' });
    return;
  }
  
  switch (action) {
    case 'admin':
      if (id === 'orders') {
        // Показать все заказы
        await showAllOrders(userId);
      } else if (id === 'filter') {
        // Показать меню фильтрации
        sendFilterMenu(userId);
      } else if (id === 'notifications') {
        // Настройки уведомлений
        await bot.sendMessage(userId, 'Здесь будут отображаться настройки уведомлений.');
      } else if (id === 'back') {
        // Вернуться в главное меню администратора
        await sendAdminMainMenu(userId, 'Панель администратора:');
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
      
      // Отправляем уведомление клиенту
      if (updatedOrder.user_id) {
        const user = await User.find(updatedOrder.user_id);
        if (user && user.telegram_id) {
          bot.sendMessage(user.telegram_id, `Статус вашего заказа #${orderId} изменен на "${ORDER_STATUSES[newStatus]}"`);
        }
      }
      
      // Отправляем уведомление поставщику
      if (updatedOrder.supplier_id) {
        const supplier = await Supplier.find(updatedOrder.supplier_id);
        if (supplier && supplier.telegram_id) {
          bot.sendMessage(supplier.telegram_id, `Администратор изменил статус заказа #${orderId} на "${ORDER_STATUSES[newStatus]}"`);
        }
      }
      
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
            [{ text: '« Назад к заказам', callback_data: 'admin:orders:' }],
            [{ text: '« Главное меню', callback_data: 'admin:back:' }]
          ]
        }
      });
      bot.answerCallbackQuery(callbackQuery.id);
      break;
  }
}

/**
 * Показывает заказы клиента
 * @param {number} chatId - ID чата
 * @param {number} userId - ID пользователя
 */
async function showClientOrders(chatId, userId) {
  try {
    // Получаем заказы пользователя
    const orders = await Order.getWhere({ user_id: userId, deleted_at: null });
    
    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, 'У вас пока нет заказов', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '« Назад в меню', callback_data: 'client:back:' }]
          ]
        }
      });
      return;
    }
    
    let message = '*Ваши заказы:*\n\n';
    
    for (const order of orders) {
      const status = ORDER_STATUSES[order.status] || 'Неизвестный статус';
      message += `📦 *Заказ #${order.id}*\n`;
      message += `💰 Сумма: ${order.total || 0} ₸\n`;
      message += `🔄 Статус: ${status}\n`;
      message += `📅 Дата: ${new Date(+order.created_at).toLocaleString('ru-RU')}\n\n`;
    }
    
    // Создаем кнопки для каждого заказа
    const orderButtons = orders.map(order => [
      { text: `📋 Детали заказа #${order.id}`, callback_data: `order:view:${order.id}` }
    ]);
    
    // Добавляем кнопку возврата в меню
    const navigationButtons = [
      [{ text: '« Назад в меню', callback_data: 'client:back:' }]
    ];
    
    // Объединяем все кнопки
    const keyboard = {
      inline_keyboard: [...orderButtons, ...navigationButtons]
    };
    
    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при получении списка заказов клиента:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при получении списка заказов', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад в меню', callback_data: 'client:back:' }]
        ]
      }
    });
  }
}

/**
 * Показывает профиль клиента
 * @param {number} chatId - ID чата
 * @param {Object} user - Данные пользователя
 */
async function showClientProfile(chatId, user) {
  let message = '*Ваш профиль:*\n\n';
  message += `👤 *Имя*: ${user.name || 'Не указано'}\n`;
  message += `📱 *Телефон*: ${user.phone || 'Не указан'}\n`;
  message += `📧 *Email*: ${user.email || 'Не указан'}\n`;
  message += `📝 *Логин*: ${user.login || 'Не указан'}\n`;
  
  // Добавляем кнопку возврата в меню
  const keyboard = {
    inline_keyboard: [
      [{ text: '« Назад в меню', callback_data: 'client:back:' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Показывает детали заказа для клиента
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showClientOrderDetails(chatId, order) {
  try {
    // Получаем информацию о товарах в заказе
    const items = await OrderItem.getByOrderId(order.id);
    
    // Получаем данные о поставщике, если есть
    let supplierInfo = '';
    if (order.supplier_id) {
      try {
        const supplier = await Supplier.find(order.supplier_id);
        if (supplier) {
          supplierInfo = `🏪 *Поставщик*: ${supplier.name || supplier.login || 'Не указан'}\n`;
          if (supplier.phone) {
            supplierInfo += `📱 *Телефон поставщика*: ${supplier.phone}\n`;
          }
        }
      } catch (error) {
        console.error('Ошибка при получении данных поставщика:', error);
      }
    }
    
    let message = `📦 *ДЕТАЛИ ЗАКАЗА #${order.id}*\n\n`;
    message += `💰 *Сумма*: ${order.total || 0} ₸\n`;
    message += `🔄 *Статус*: ${ORDER_STATUSES[order.status] || 'Неизвестный статус'}\n`;
    if (supplierInfo) {
      message += `\n${supplierInfo}\n`;
    }
    
    // Информация о товарах
    message += `\n📋 *Товары:*\n`;
    
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
    
    // Добавляем информацию о доставке, если есть
    if (order.delivery_options) {
      message += `\n🚚 *Доставка*: ${order.delivery_options}\n`;
    }
    
    // Формируем кнопки в зависимости от статуса заказа
    const buttons = [];
    
    // Если заказ готов к отправке, добавляем кнопку заказа доставки
    if (order.status === 2) {
      buttons.push([{ text: '🚚 Заказать доставку', callback_data: `order:request_delivery:${order.id}` }]);
    }
    
    // Добавляем кнопки навигации
    buttons.push([{ text: '« Назад к заказам', callback_data: 'client:orders:' }]);
    buttons.push([{ text: '« Главное меню', callback_data: 'client:back:' }]);
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  } catch (error) {
    console.error('Ошибка при получении деталей заказа:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при получении деталей заказа', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад к заказам', callback_data: 'client:orders:' }],
          [{ text: '« Главное меню', callback_data: 'client:back:' }]
        ]
      }
    });
  }
}

/**
 * Показывает опции доставки для клиента
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showDeliveryOptions(chatId, order) {
  // Формируем список опций доставки
  const keyboard = {
    inline_keyboard: [
      [{ text: '🚕 Яндекс Такси (1500 ₸)', callback_data: `delivery:${order.id}:Яндекс Такси` }],
      [{ text: '🚗 InDriver (от 1000 ₸)', callback_data: `delivery:${order.id}:InDriver` }],
      [{ text: '🛵 Курьер (2000 ₸)', callback_data: `delivery:${order.id}:Курьер` }],
      [{ text: '« Назад к деталям заказа', callback_data: `order:view:${order.id}` }]
    ]
  };
  
  await bot.sendMessage(chatId, 'Выберите способ доставки:', {
    reply_markup: keyboard
  });
}

/**
 * Показывает активные заказы для поставщика
 * @param {number} chatId - ID чата
 * @param {number} supplierId - ID поставщика
 */
async function showSupplierActiveOrders(chatId, supplierId) {
  try {
    // Получаем активные заказы поставщика (статусы 0-3)
    const orders = await Order.getWhere({
      supplier_id: supplierId,
      deleted_at: null,
      status: [0, 1, 2, 3] // Активные статусы: Создан, В сборке, Готов к отправке, В пути
    });
    
    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, 'У вас нет активных заказов', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '« Назад в меню', callback_data: 'supplier:back:' }]
          ]
        }
      });
      return;
    }
    
    let message = '*Активные заказы:*\n\n';
    
    for (const order of orders) {
      const status = ORDER_STATUSES[order.status] || 'Неизвестный статус';
      message += `📦 *Заказ #${order.id}*\n`;
      message += `💰 Сумма: ${order.total || 0} ₸\n`;
      message += `🔄 Статус: ${status}\n`;
      message += `📅 Дата: ${new Date(+order.created_at).toLocaleString('ru-RU')}\n\n`;
    }
    
    // Создаем кнопки для каждого заказа
    const orderButtons = orders.map(order => [
      { text: `📋 Детали заказа #${order.id}`, callback_data: `order:view:${order.id}` }
    ]);
    
    // Добавляем кнопку возврата в меню
    const navigationButtons = [
      [{ text: '« Назад в меню', callback_data: 'supplier:back:' }]
    ];
    
    // Объединяем все кнопки
    const keyboard = {
      inline_keyboard: [...orderButtons, ...navigationButtons]
    };
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при получении списка активных заказов:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при получении списка заказов', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад в меню', callback_data: 'supplier:back:' }]
        ]
      }
    });
  }
}

/**
 * Показывает историю заказов для поставщика
 * @param {number} chatId - ID чата
 * @param {number} supplierId - ID поставщика
 */
async function showSupplierOrderHistory(chatId, supplierId) {
  try {
    // Получаем завершенные заказы поставщика (статусы 4, 5)
    const orders = await Order.getWhere({
      supplier_id: supplierId,
      deleted_at: null,
      status: [4, 5] // Завершенные статусы: Доставлен, Отменен
    });
    
    if (!orders || orders.length === 0) {
      await bot.sendMessage(chatId, 'У вас нет завершенных заказов', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '« Назад в меню', callback_data: 'supplier:back:' }]
          ]
        }
      });
      return;
    }
    
    let message = '*История заказов:*\n\n';
    
    for (const order of orders) {
      const status = ORDER_STATUSES[order.status] || 'Неизвестный статус';
      message += `📦 *Заказ #${order.id}*\n`;
      message += `💰 Сумма: ${order.total || 0} ₸\n`;
      message += `🔄 Статус: ${status}\n`;
      message += `📅 Дата: ${new Date(+order.created_at).toLocaleString('ru-RU')}\n\n`;
    }
    
    // Создаем кнопки для каждого заказа
    const orderButtons = orders.map(order => [
      { text: `📋 Детали заказа #${order.id}`, callback_data: `order:view:${order.id}` }
    ]);
    
    // Добавляем кнопку возврата в меню
    const navigationButtons = [
      [{ text: '« Назад в меню', callback_data: 'supplier:back:' }]
    ];
    
    // Объединяем все кнопки
    const keyboard = {
      inline_keyboard: [...orderButtons, ...navigationButtons]
    };
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при получении истории заказов:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при получении истории заказов', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад в меню', callback_data: 'supplier:back:' }]
        ]
      }
    });
  }
}

/**
 * Показывает детали заказа для поставщика
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showSupplierOrderDetails(chatId, order) {
  try {
    // Получаем информацию о товарах в заказе
    const items = await OrderItem.getByOrderId(order.id);
    
    // Получаем информацию о клиенте
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
    
    let message = `📦 *ДЕТАЛИ ЗАКАЗА #${order.id}*\n\n`;
    
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
    
    // Добавляем информацию о времени готовности, если есть
    if (order.ready_time) {
      message += `⏱ *Время готовности*: ${new Date(+order.ready_time).toLocaleString('ru-RU')}\n`;
    }
    
    // Добавляем информацию о доставке, если есть
    if (order.delivery_options) {
      message += `🚚 *Доставка*: ${order.delivery_options}\n`;
    }
    
    // Формируем кнопки в зависимости от статуса заказа
    const buttons = [];
    
    // Кнопка изменения статуса
    buttons.push([{ text: '🔄 Изменить статус', callback_data: `order:status:${order.id}` }]);
    
    // Добавляем кнопки навигации
    buttons.push([{ text: '« Назад к активным заказам', callback_data: 'supplier:active_orders:' }]);
    buttons.push([{ text: '« Главное меню', callback_data: 'supplier:back:' }]);
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  } catch (error) {
    console.error('Ошибка при получении деталей заказа:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при получении деталей заказа', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '« Назад к заказам', callback_data: 'supplier:active_orders:' }],
          [{ text: '« Главное меню', callback_data: 'supplier:back:' }]
        ]
      }
    });
  }
}

/**
 * Показывает опции для изменения статуса заказа
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showOrderStatusOptions(chatId, order) {
  const currentStatus = order.status;
  
  // Создаем кнопки для изменения статуса
  // Показываем только те статусы, которые следуют за текущим
  const buttons = [];
  
  if (currentStatus < 1) {
    buttons.push([{ text: '✅ Принят в работу', callback_data: `status:${order.id}:1` }]);
  }
  
  if (currentStatus < 2) {
    buttons.push([{ text: '📦 Готов к отправке', callback_data: `status:${order.id}:2` }]);
  }
  
  if (currentStatus < 3) {
    buttons.push([{ text: '🚗 В пути', callback_data: `status:${order.id}:3` }]);
  }
  
  if (currentStatus < 4) {
    buttons.push([{ text: '📬 Доставлен', callback_data: `status:${order.id}:4` }]);
  }
  
  // Кнопка отмены всегда доступна, если заказ еще не отменен и не доставлен
  if (currentStatus < 4) {
    buttons.push([{ text: '❌ Отменить заказ', callback_data: `status:${order.id}:5` }]);
  }
  
  // Добавляем кнопки навигации
  buttons.push([{ text: '« Назад к деталям заказа', callback_data: `order:view:${order.id}` }]);
  
  await bot.sendMessage(chatId, `Выберите новый статус для заказа #${order.id}:`, {
    reply_markup: {
      inline_keyboard: buttons
    }
  });
}

/**
 * Показывает опции времени ожидания для поставщика
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showWaitingTimeOptions(chatId, order) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '⏱ 5 минут', callback_data: `waiting:${order.id}:5` },
        { text: '⏱ 10 минут', callback_data: `waiting:${order.id}:10` }
      ],
      [
        { text: '⏱ 15 минут', callback_data: `waiting:${order.id}:15` },
        { text: '⏱ 20 минут', callback_data: `waiting:${order.id}:20` }
      ],
      [
        { text: '⏱ 30 минут', callback_data: `waiting:${order.id}:30` },
        { text: '⏱ 40 минут', callback_data: `waiting:${order.id}:40` }
      ],
      [
        { text: '« Пропустить', callback_data: `order:view:${order.id}` }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, 'Укажите примерное время ожидания готовности заказа:', {
    reply_markup: keyboard
  });
}

// Экспортируем бот для использования в других модулях
export { bot };

export default {
  sendOrderNotification
};