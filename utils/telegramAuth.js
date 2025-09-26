import axios from 'axios';
import * as User from '#models/user.js';
import * as Supplier from '#models/supplier.js';
import knex from '#models/knex.js';
import bcrypt from 'bcryptjs';

// Объект для хранения сессий пользователей
const userSessions = {};

/**
 * Авторизация менеджера по логину и паролю
 * @param {string} login - Логин менеджера
 * @param {string} password - Пароль менеджера
 * @returns {Promise<Object|null>} - Данные менеджера или null при ошибке
 */
export const authAdmin = async (login, password) => {
  try {
    // Используем прямой SQL запрос через knex для надежности
    const db = knex();
    const manager = await db('user')
      .where({ login, role: 'manager', deleted_at: null })
      .first();
    
    if (!manager) {
      return null;
    }
    
    // Проверяем пароль
    const isPasswordCorrect = await bcrypt.compare(password, manager.password);
    
    if (!isPasswordCorrect) {
      return null;
    }
    
    return {
      user: manager,
      accessToken: 'manager_token',
      role: 'admin' // Используем роль 'admin' для совместимости с существующим кодом
    };
  } catch (error) {
    console.error('Ошибка авторизации менеджера:', error);
    return null;
  }
};

/**
 * Авторизация поставщика по логину и паролю
 */
export const authSupplier = async (login, password) => {
  try {
    const supplier = await Supplier.findWhereActive({ login });
    if (!supplier) return null;
    const isPasswordCorrect = await bcrypt.compare(password, supplier.password);
    if (!isPasswordCorrect) return null;
    return {
      user: supplier,
      accessToken: 'supplier_token',
      role: 'supplier'
    };
  } catch (error) {
    console.error('Ошибка авторизации поставщика:', error);
    return null;
  }
};

/**
 * Авторизация клиента по номеру телефона
 * @param {string} phone - Номер телефона клиента
 * @returns {Promise<Object|null>} - Данные клиента или null при ошибке
 */
export const authClientByPhone = async (phone) => {
  try {
    // Удалим все нецифровые символы из номера телефона для нормализации
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // Попробуем найти пользователя с номером телефона, который заканчивается на normalizedPhone
    const db = knex();
    let user = null;
    
    try {
      // Выполняем SQL запрос напрямую для поиска по LIKE
      const result = await db('user')
        .whereRaw('phone LIKE ?', [`%${normalizedPhone}`])
        .andWhere('deleted_at', null)
        .first();
      
      if (result) {
        user = result;
      }
    } catch (dbError) {
      console.error('Ошибка при поиске по LIKE:', dbError);
    }
    
    if (!user) {
      // Если не нашли по LIKE, пробуем точное совпадение
      const users = await User.findWhereActive({ phone: normalizedPhone });
      if (users && users.length > 0) {
        user = users[0];
      }
    }
    
    if (user) {
      return {
        user,
        accessToken: 'phone_auth_token',
        role: user.role === 'manager' ? 'admin' : 'client' // Проверяем роль пользователя
      };
    }
    return null;
  } catch (error) {
    console.error('Ошибка авторизации клиента по телефону:', error);
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
  return !!session && !!session.user;
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
    // Проверяем, есть ли пользователь (manager/client) с таким Telegram ID
    const users = await User.findWhereActive({ telegram_id: String(telegramId) });
    const user = users && users.length > 0 ? users[0] : null;
    
    if (user) {
      // Определяем роль на основе записи в БД
      const role = user.role === 'manager' || user.role === 'admin' ? 'admin' : 'client';
      
      // Создаем сессию пользователя
      return createSession(telegramId, {
        user,
        role,
        accessToken: 'telegram_auto_auth'
      });
    }
    
    // Иначе проверяем поставщика по полю telegram_id
    const suppliers = await Supplier.findWhereActive({ telegram_id: String(telegramId) });
    const supplier = suppliers && suppliers.length > 0 ? suppliers[0] : null;
    if (supplier) {
      return createSession(telegramId, {
        user: supplier,
        role: 'supplier',
        accessToken: 'telegram_auto_auth_supplier'
      });
    }

    return null;
  } catch (error) {
    console.error('Ошибка при автоматической авторизации по Telegram ID:', error);
    return null;
  }
};

/**
 * Инициирует процесс авторизации администратора
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {Object} - Состояние авторизации
 */
export const startAdminAuthProcess = (telegramId) => {
  // Создаем или обновляем сессию
  const session = getSession(telegramId) || createSession(telegramId, {});
  
  // Устанавливаем состояние авторизации
  session.authState = 'awaiting_admin_login';
  
  return session;
};

/**
 * Инициирует процесс авторизации клиента по телефону
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {Object} - Состояние авторизации
 */
export const startClientPhoneAuthProcess = (telegramId) => {
  // Создаем или обновляем сессию
  const session = getSession(telegramId) || createSession(telegramId, {});
  
  // Устанавливаем состояние авторизации
  session.authState = 'awaiting_phone';
  
  return session;
};

/**
 * Очистка старых сессий
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
  authAdmin,
  authSupplier,
  authClientByPhone,
  createSession,
  getSession,
  isAuthenticated,
  getUserRole,
  logout,
  autoAuthByTelegramId,
  startAdminAuthProcess,
  startClientPhoneAuthProcess,
  cleanupSessions
}; 