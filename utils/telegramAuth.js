import axios from 'axios';
import * as User from '#models/user.js';
import * as Supplier from '#models/supplier.js';

// Объект для хранения сессий пользователей
const userSessions = {};

/**
 * Авторизация поставщика
 * @param {string} login - Логин поставщика
 * @param {string} password - Пароль поставщика
 * @returns {Promise<Object|null>} - Данные поставщика или null при ошибке
 */
export const authSupplier = async (login, password) => {
  try {
    const response = await axios.post('http://localhost:8080/suppliers/login', {
      login,
      password
    });
    
    if (response.data && response.data.supplier) {
      return {
        user: response.data.supplier,
        accessToken: response.data.accessToken,
        role: 'supplier'
      };
    }
    return null;
  } catch (error) {
    console.error('Ошибка авторизации поставщика:', error.message);
    return null;
  }
};

/**
 * Авторизация клиента
 * @param {string} login - Логин клиента
 * @param {string} password - Пароль клиента
 * @returns {Promise<Object|null>} - Данные клиента или null при ошибке
 */
export const authClient = async (login, password) => {
  try {
    const response = await axios.post('http://localhost:8080/auth/login', {
      login,
      password
    });
    
    if (response.data && response.data.user) {
      return {
        user: response.data.user,
        accessToken: response.data.accessToken,
        role: 'client'
      };
    }
    return null;
  } catch (error) {
    console.error('Ошибка авторизации клиента:', error.message);
    return null;
  }
};

/**
 * Создает новую сессию пользователя
 * @param {number} telegramId - ID пользователя в Telegram
 * @param {Object} userData - Данные пользователя
 * @returns {Object} - Объект сессии
 */
export const createSession = (telegramId, userData) => {
  userSessions[telegramId] = {
    ...userData,
    lastActivity: Date.now()
  };
  
  return userSessions[telegramId];
};

/**
 * Получает текущую сессию пользователя
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {Object|null} - Данные сессии или null
 */
export const getSession = (telegramId) => {
  const session = userSessions[telegramId];
  
  if (session) {
    // Обновляем время последней активности
    session.lastActivity = Date.now();
    return session;
  }
  
  return null;
};

/**
 * Проверяет, авторизован ли пользователь
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {boolean} - true, если пользователь авторизован
 */
export const isAuthenticated = (telegramId) => {
  const session = getSession(telegramId);
  return !!session && !!session.user && !!session.accessToken;
};

/**
 * Получает роль пользователя
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {string|null} - Роль пользователя или null
 */
export const getUserRole = (telegramId) => {
  const session = getSession(telegramId);
  return session ? session.role : null;
};

/**
 * Выход пользователя из системы
 * @param {number} telegramId - ID пользователя в Telegram
 */
export const logout = (telegramId) => {
  delete userSessions[telegramId];
};

/**
 * Попытка авторизации по Telegram ID
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {Promise<Object|null>} - Данные сессии или null
 */
export const autoAuthByTelegramId = async (telegramId) => {
  try {
    // Проверяем, есть ли пользователь с таким Telegram ID
    const user = await User.findWhereActive({ telegram_id: String(telegramId) });
    
    if (user && user.length > 0) {
      // Создаем сессию пользователя
      return createSession(telegramId, {
        user: user[0],
        role: 'client',
        // Для простоты MVP не используем полноценный accessToken
        accessToken: 'telegram_auto_auth'
      });
    }
    
    // Проверяем, есть ли поставщик с таким Telegram ID
    const supplier = await Supplier.findWhereActive({ telegram_id: String(telegramId) });
    
    if (supplier && supplier.length > 0) {
      // Создаем сессию поставщика
      return createSession(telegramId, {
        user: supplier[0],
        role: 'supplier',
        // Для простоты MVP не используем полноценный accessToken
        accessToken: 'telegram_auto_auth'
      });
    }
    
    // Если не нашли ни пользователя, ни поставщика
    return null;
  } catch (error) {
    console.error('Ошибка при автоматической авторизации по Telegram ID:', error);
    return null;
  }
};

/**
 * Инициирует процесс авторизации
 * @param {number} telegramId - ID пользователя в Telegram
 * @param {string} role - Роль (client или supplier)
 * @returns {Object} - Состояние авторизации
 */
export const startAuthProcess = (telegramId, role) => {
  // Создаем или обновляем сессию
  const session = getSession(telegramId) || createSession(telegramId, {});
  
  // Устанавливаем состояние авторизации
  session.authState = 'awaiting_login';
  session.authRole = role;
  
  return session;
};

/**
 * Очистка старых сессий
 * Вызывайте эту функцию периодически для очистки неактивных сессий
 * @param {number} maxAge - Максимальный возраст сессии в миллисекундах (по умолчанию 24 часа)
 */
export const cleanupSessions = (maxAge = 24 * 60 * 60 * 1000) => {
  const now = Date.now();
  
  for (const telegramId in userSessions) {
    const session = userSessions[telegramId];
    
    if (now - session.lastActivity > maxAge) {
      delete userSessions[telegramId];
    }
  }
};

// Экспортируем все функции
export default {
  authSupplier,
  authClient,
  createSession,
  getSession,
  isAuthenticated,
  getUserRole,
  logout,
  autoAuthByTelegramId,
  startAuthProcess,
  cleanupSessions
}; 