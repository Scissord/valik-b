import bcrypt from 'bcryptjs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  // Проверка, существует ли уже пользователь с ролью менеджера
  // const existingManager = await knex('user')
  //   .where({ role: 'manager' })
  //   .first();

  // if (!existingManager) {
  //   // Генерируем хеш пароля при помощи bcrypt
  //   const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash('manager123', salt);

  //   // Вставляем пользователя-менеджера
  //   await knex('user').insert([
  //     {
  //       login: 'manager',
  //       password: hashedPassword,
  //       email: 'manager@example.com',
  //       full_name: 'Менеджер',
  //       phone: '77777777777',
  //       role: 'manager'
  //     }
  //   ]);
  // }
}; 