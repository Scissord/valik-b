import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import * as Order from '#models/order.js';
import * as OrderItem from '#models/order_item.js';
import * as Product from '#models/product.js';
import * as User from '#models/user.js';
import * as Supplier from '#models/supplier.js';
import * as telegramAuth from './telegramAuth.js';

dotenv.config();

// Получаем токен из переменных окружения для клиентского бота
const token = process.env.TELEGRAM_CLIENT_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CLIENT_CHAT_ID;

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
  console.error('Ошибка инициализации Telegram клиентского бота:', error.message);
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
      
      if (session && session.role === 'client') {
        // Если автоматическая авторизация успешна для клиента
        const userName = session.user.name || session.user.login || '';
        
        bot.sendMessage(userId, `Добро пожаловать, ${userName}! Вы автоматически авторизованы как клиент.`);
            sendClientMainMenu(userId, 'Меню клиента:');
        return;
      } else if (session && session.role === 'admin') {
        // Если это менеджер, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как менеджер. Пожалуйста, используйте бота для менеджеров.');
        telegramAuth.logout(userId);
        return;
      }
    } catch (error) {
      console.error('Ошибка при автоматической авторизации:', error);
    }
    
    // Если автоматическая авторизация не удалась, проверяем обычную авторизацию
    if (telegramAuth.isAuthenticated(userId)) {
      const role = telegramAuth.getUserRole(userId);
      if (role === 'client') {
          sendClientMainMenu(userId, 'Добро пожаловать в меню клиента!');
      } else {
        // Если это менеджер, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как менеджер. Пожалуйста, используйте бота для менеджеров.');
        telegramAuth.logout(userId);
      }
    } else {
      sendAuthMenu(userId, 'Добро пожаловать в систему отслеживания заказов! Для начала работы необходимо авторизоваться:');
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
      if (role === 'client') {
          sendClientMainMenu(userId, 'Меню клиента:');
      } else {
        // Если это менеджер, сообщаем что нужно использовать другого бота
        bot.sendMessage(userId, 'Вы авторизованы как менеджер. Пожалуйста, используйте бота для менеджеров.');
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
    
    // Обработка авторизации клиента по телефону
    if (session.authState === 'awaiting_phone') {
      const phone = msg.text;
      
      const authData = await telegramAuth.authClientByPhone(phone);
      
      // Удаляем временные данные авторизации
      delete session.authState;
      
      if (authData) {
        try {
          // Сохраняем telegram_id пользователя в базе данных
          await User.update(authData.user.id, { 
            telegram_id: String(userId)
          });
        } catch (error) {
          console.error('Ошибка обновления telegram_id пользователя:', error);
        }
        
        // Создаем сессию клиента
        telegramAuth.createSession(userId, authData);
        
        bot.sendMessage(userId, `Авторизация успешна! Вы вошли как ${authData.user.name || authData.user.login || 'Клиент'}`);
        sendClientMainMenu(userId, 'Добро пожаловать в меню клиента!');
      } else {
        bot.sendMessage(userId, 'Пользователь с указанным номером телефона не найден.');
        sendAuthMenu(userId, 'Попробуйте снова или обратитесь к менеджеру:');
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
        if (id === 'client') {
          // Инициируем процесс авторизации клиента по телефону
          telegramAuth.startClientPhoneAuthProcess(userId);
          
          bot.sendMessage(userId, 'Введите номер телефона, который вы указывали при оформлении заказа:');
          bot.answerCallbackQuery(callbackQuery.id);
        } else if (id === 'admin') {
          // Сообщаем, что для авторизации менеджера нужно использовать другого бота
          bot.sendMessage(userId, 'Для авторизации как менеджер, пожалуйста, используйте бота для менеджеров.');
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

      // Обрабатываем действия клиента
      if (role === 'client') {
        await handleClientActions(action, id, value, userId, callbackQuery);
      }
      
    } catch (error) {
      console.error('Ошибка обработки запроса:', error);
      bot.sendMessage(userId, `Произошла ошибка: ${error.message}`);
      bot.answerCallbackQuery(callbackQuery.id);
    }
  });
}

/**
 * Отправляет основное меню в зависимости от роли пользователя
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение для пользователя
 */
async function sendAuthMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Найти заказ', callback_data: 'auth:client' }]
    ]
  };
  
  bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Отправляет клиентское меню
 * @param {number} chatId - ID чата
 * @param {string} message - Сообщение для пользователя
 */
async function sendClientMainMenu(chatId, message) {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Мои заказы', callback_data: 'client:orders' }],
      [{ text: 'Мой профиль', callback_data: 'client:profile' }],
      [{ text: 'Выйти из аккаунта', callback_data: 'logout' }]
    ]
  };
  
  bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
}

/**
 * Обработка действий клиента
 * @param {string} action - Тип действия
 * @param {string} id - ID объекта
 * @param {string} value - Значение
 * @param {number} userId - ID пользователя Telegram
 * @param {Object} callbackQuery - Объект callback запроса
 */
async function handleClientActions(action, id, value, userId, callbackQuery) {
  if (action === 'client') {
    if (id === 'orders') {
      await showClientOrders(userId);
    } else if (id === 'profile') {
      const session = telegramAuth.getSession(userId);
      await showClientProfile(userId, session.user);
    } else if (id === 'order') {
      try {
        const order = await Order.find(value);
        if (!order) {
          bot.sendMessage(userId, 'Заказ не найден');
      return;
    }
        await showClientOrderDetails(userId, order);
  } catch (error) {
        bot.sendMessage(userId, 'Ошибка при получении данных заказа: ' + error.message);
      }
    } else if (id === 'back_to_orders') {
      await showClientOrders(userId);
    } else if (id === 'back_to_menu') {
      sendClientMainMenu(userId, 'Главное меню:');
    }
  } else if (action === 'order') {
    if (id === 'delivery') {
      const order = await Order.find(value);
      if (!order) {
        bot.sendMessage(userId, 'Заказ не найден');
        return;
      }
      await showDeliveryOptions(userId, order);
    }
  }
  
  bot.answerCallbackQuery(callbackQuery.id);
}

/**
 * Показывает список заказов клиента
 * @param {number} chatId - ID чата
 * @param {number} userId - ID пользователя в Telegram
 */
async function showClientOrders(chatId) {
  try {
    const session = telegramAuth.getSession(chatId);
    if (!session || !session.user) {
      bot.sendMessage(chatId, 'Необходимо авторизоваться для просмотра заказов.');
      return;
    }
    
    const orders = await Order.getWhere({ user_id: session.user.id });
    
    if (!orders || orders.length === 0) {
      bot.sendMessage(chatId, 'У вас пока нет заказов.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в меню', callback_data: 'client:back_to_menu' }]
          ]
        }
      });
      return;
    }
    
    let message = 'Ваши заказы:\n\n';
    const keyboard = {
      inline_keyboard: []
    };
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const date = new Date(parseInt(order.created_at));
      const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
      
      message += `Заказ #${order.id} от ${formattedDate}\n`;
      message += `Статус: ${ORDER_STATUSES[order.status]}\n`;
      message += `Сумма: ${order.total} ₸\n\n`;
      
      keyboard.inline_keyboard.push([
        { text: `Детали заказа #${order.id}`, callback_data: `client:order:${order.id}` }
      ]);
    }
    
    keyboard.inline_keyboard.push([
      { text: 'Вернуться в меню', callback_data: 'client:back_to_menu' }
    ]);
    
    bot.sendMessage(chatId, message, {
    reply_markup: keyboard
  });
    } catch (error) {
    console.error('Ошибка при получении списка заказов:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при получении списка заказов.');
  }
}

/**
 * Показывает информацию о профиле клиента
 * @param {number} chatId - ID чата
 * @param {Object} user - Объект пользователя
 */
async function showClientProfile(chatId, user) {
  try {
    if (!user) {
      bot.sendMessage(chatId, 'Информация о пользователе недоступна.');
      return;
    }
    
    let message = '🧑‍💼 *Информация о вашем профиле*\n\n';
    message += `Имя: ${user.name || 'Не указано'}\n`;
    message += `Телефон: ${user.phone || 'Не указан'}\n`;
    message += `Email: ${user.email || 'Не указан'}\n`;
    message += `Адрес: ${user.address || 'Не указан'}\n`;
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
    inline_keyboard: [
          [{ text: 'Вернуться в меню', callback_data: 'client:back_to_menu' }]
        ]
      }
    });
  } catch (error) {
    console.error('Ошибка при получении данных профиля:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при получении данных профиля.');
  }
}

/**
 * Показывает детали заказа клиента
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showClientOrderDetails(chatId, order) {
  try {
    const items = await OrderItem.getByOrderId(order.id);
    
    if (!items || items.length === 0) {
      bot.sendMessage(chatId, 'Информация о товарах в заказе недоступна.');
    return;
  }

    let message = `📦 *Детали заказа #${order.id}*\n\n`;
    message += `Статус: ${ORDER_STATUSES[order.status]}\n`;
    
    const date = new Date(parseInt(order.created_at));
    const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
    message += `Дата заказа: ${formattedDate}\n`;
    message += `🏠 Адрес доставки: ${order.address || 'Не указан'}\n`;
    if (order.additional_info) {
      message += `📝 Комментарий: ${order.additional_info}\n`;
    }
    message += `\n`;
    
    message += '*Товары:*\n';
    
    let totalSum = 0;
    
      for (const item of items) {
      const product = await Product.find(item.product_id);
      
      if (product) {
        const productName = product.title || product.name || 'Товар';
        const quantity = item.quantity;
        const price = product.price;
        const total = item.total;
        
        message += `- ${productName}\n`;
        message += `  ${quantity} x ${price} = ${total} ₸\n`;
        
        totalSum += parseFloat(total);
      }
    }
    
    message += `\n*Итого: ${totalSum.toFixed(2)} ₸*\n`;
    
    const keyboard = {
        inline_keyboard: [
        [{ text: 'Отследить доставку', callback_data: `order:delivery:${order.id}` }],
        [{ text: 'Назад к заказам', callback_data: 'client:back_to_orders' }],
        [{ text: 'Вернуться в меню', callback_data: 'client:back_to_menu' }]
      ]
    };
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      reply_markup: keyboard
      });
  } catch (error) {
    console.error('Ошибка при получении деталей заказа:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при получении деталей заказа.');
  }
}

/**
 * Показывает информацию о доставке
 * @param {number} chatId - ID чата
 * @param {Object} order - Объект заказа
 */
async function showDeliveryOptions(chatId, order) {
  try {
    let message = `🚚 *Информация о доставке заказа #${order.id}*\n\n`;
    
    switch (parseInt(order.status)) {
      case 0:
        message += 'Статус: Заказ создан\n';
        message += 'Ваш заказ принят и скоро будет передан в сборку.';
        break;
      case 1:
        message += 'Статус: В сборке\n';
        message += 'Ваш заказ находится в сборке. Мы уведомим вас, когда он будет готов к отправке.';
        break;
      case 2:
        message += 'Статус: Готов к отправке\n';
        message += 'Ваш заказ собран и готов к отправке. Скоро он будет передан курьеру.';
        break;
      case 3:
        message += 'Статус: В пути\n';
        message += 'Ваш заказ в пути. Курьер доставит его в ближайшее время.';
        break;
      case 4:
        message += 'Статус: Доставлен\n';
        message += 'Ваш заказ успешно доставлен. Спасибо за покупку!';
        break;
      case 5:
        message += 'Статус: Отменен\n';
        message += 'К сожалению, заказ был отменен.';
        break;
      default:
        message += `Статус: ${order.status}\n`;
        message += 'Информация о доставке недоступна.';
    }
    
  const keyboard = {
    inline_keyboard: [
        [{ text: 'Назад к деталям заказа', callback_data: `client:order:${order.id}` }],
        [{ text: 'Вернуться в меню', callback_data: 'client:back_to_menu' }]
      ]
    };
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    reply_markup: keyboard
  });
  } catch (error) {
    console.error('Ошибка при получении информации о доставке:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при получении информации о доставке.');
  }
}

/**
 * Получает детальную информацию о заказе для отправки уведомления
 * @param {Object} order - Объект заказа
 * @param {Array} items - Товары в заказе
 * @returns {string} - Форматированное сообщение
 */
async function getOrderDetails(order, items) {
  let message = `📦 *Новый заказ #${order.id}*\n\n`;
  
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
  message += `📅 *Дата:* ${new Date(parseInt(order.created_at)).toLocaleString()}\n`;
  message += `🏠 *Адрес доставки:* ${order.address || 'Не указан'}\n`;
  if (order.additional_info) {
    message += `📝 *Комментарий:* ${order.additional_info}\n`;
  }
  message += `\n`;
  
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
 * Отправляет уведомление о новом заказе менеджерам
 * @param {Object} order - Объект заказа
 * @param {Array} items - Массив товаров в заказе
 */
export const sendOrderNotification = async (order, items) => {
  try {
    // Отправка уведомления клиенту о создании заказа - отключена по требованию
    // При создании заказа клиенту уведомление не отправляется
  } catch (error) {
    console.error('Ошибка в функции отправки уведомления о заказе:', error.message);
  }
};

/**
 * Отправляет уведомление клиенту об изменении статуса заказа
 * @param {Object} order - Объект заказа с обновленным статусом
 */
export const sendStatusUpdateNotification = async (order) => {
  try {
    // Находим пользователя (клиента) по ID из заказа
    const user = await User.find(order.user_id);
    
    // Если у пользователя есть telegram_id, отправляем ему уведомление
    if (user && user.telegram_id) {
      const clientChatId = user.telegram_id;
      
      // Формируем сообщение в зависимости от статуса
      let statusMessage = '';
      let additionalInfo = '';
      
      switch (parseInt(order.status)) {
        case 0:
          statusMessage = 'создан';
          additionalInfo = 'Ожидайте подтверждения от менеджера.';
          break;
        case 1:
          statusMessage = 'в сборке';
          additionalInfo = 'Наш сотрудник формирует ваш заказ. Мы уведомим вас, когда он будет готов к отправке.';
          break;
        case 2:
          statusMessage = 'готов к отправке';
          additionalInfo = 'Ваш заказ собран и скоро будет передан в доставку.';
          break;
        case 3:
          statusMessage = 'в пути';
          additionalInfo = 'Ваш заказ в пути. Курьер доставит его в ближайшее время.';
          break;
        case 4:
          statusMessage = 'доставлен';
          additionalInfo = 'Спасибо за покупку! Будем рады вашим отзывам.';
          break;
        case 5:
          statusMessage = 'отменен';
          additionalInfo = 'К сожалению, ваш заказ был отменен. Для уточнения причин свяжитесь с нашим менеджером.';
          break;
        default:
          statusMessage = `изменен на: ${order.status}`;
          additionalInfo = 'Для получения дополнительной информации свяжитесь с нашим менеджером.';
      }
      
      // Формируем сообщение
      let message = `🔔 *Статус вашего заказа #${order.id} изменен*\n\n`;
      message += `Новый статус: *${statusMessage}*\n\n`;
      message += additionalInfo;
      
      // Кнопки для удобной навигации
  const keyboard = {
    inline_keyboard: [
          [{ text: 'Детали заказа', callback_data: `client:order:${order.id}` }],
          [{ text: 'Все мои заказы', callback_data: 'client:orders' }]
        ]
      };
      
      // Отправляем уведомление клиенту
      await bot.sendMessage(clientChatId, message, {
        parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}
  } catch (error) {
    console.error('Ошибка отправки уведомления клиенту об изменении статуса заказа:', error.message);
  }
};

export { bot };