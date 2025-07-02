import * as User from '#models/user.js';
import bcrypt from 'bcryptjs';

/**
 * Получить список всех менеджеров
 */
export const getManagers = async (req, res) => {
  try {
    // Проверяем, что запрос делает менеджер или администратор
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).send({ message: 'Доступ запрещен. Требуются права менеджера.' });
    }

    const managers = await User.getWhereActive({ role: 'manager' });
    
    // Удаляем пароли из ответа
    const sanitizedManagers = managers.map(manager => {
      const { password, ...managerData } = manager;
      return managerData;
    });

    return res.status(200).send(sanitizedManagers);
  } catch (error) {
    console.error('Ошибка при получении списка менеджеров:', error);
    return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Создать нового менеджера
 */
export const createManager = async (req, res) => {
  try {
    // Проверяем, что запрос делает менеджер или администратор
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).send({ message: 'Доступ запрещен. Требуются права менеджера.' });
    }

    const { login, password, email, full_name, phone } = req.body;

    // Проверяем, существует ли уже пользователь с таким логином или email
    const existingUser = await User.findWhereActive({ login });
    if (existingUser && existingUser.length > 0) {
      return res.status(400).send({ message: 'Пользователь с таким логином уже существует' });
    }

    const existingEmail = await User.findWhereActive({ email });
    if (existingEmail && existingEmail.length > 0) {
      return res.status(400).send({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем менеджера
    const manager = await User.create({
      login,
      password: hashedPassword,
      email,
      full_name,
      phone,
      role: 'manager'
    });

    // Удаляем пароль из ответа
    const { password: _, ...managerData } = manager;

    return res.status(201).send(managerData);
  } catch (error) {
    console.error('Ошибка при создании менеджера:', error);
    return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Обновить данные менеджера
 */
export const updateManager = async (req, res) => {
  try {
    // Проверяем, что запрос делает менеджер или администратор
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).send({ message: 'Доступ запрещен. Требуются права менеджера.' });
    }

    const { id } = req.params;
    const { login, password, email, full_name, phone } = req.body;

    // Проверяем, существует ли менеджер
    const manager = await User.find(id);
    if (!manager || manager.role !== 'manager') {
      return res.status(404).send({ message: 'Менеджер не найден' });
    }

    // Готовим данные для обновления
    const updateData = {};
    if (login) updateData.login = login;
    if (email) updateData.email = email;
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;

    // Если передан пароль, хешируем его
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Обновляем менеджера
    const updatedManager = await User.update(id, updateData);

    // Удаляем пароль из ответа
    const { password: _, ...managerData } = updatedManager;

    return res.status(200).send(managerData);
  } catch (error) {
    console.error('Ошибка при обновлении менеджера:', error);
    return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Удалить менеджера (мягкое удаление)
 */
export const deleteManager = async (req, res) => {
  try {
    // Проверяем, что запрос делает менеджер или администратор
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
      return res.status(403).send({ message: 'Доступ запрещен. Требуются права менеджера.' });
    }

    const { id } = req.params;

    // Проверяем, существует ли менеджер
    const manager = await User.find(id);
    if (!manager || manager.role !== 'manager') {
      return res.status(404).send({ message: 'Менеджер не найден' });
    }

    // Удаляем менеджера (мягкое удаление)
    await User.softDelete(id);

    return res.status(200).send({ message: 'Менеджер успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении менеджера:', error);
    return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
  }
}; 