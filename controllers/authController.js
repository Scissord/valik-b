import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as Supplier from '#models/supplier.js';
import * as SupplierToken from '#models/supplier_token.js';
import generateTokens from '#utils/generateTokens.js';

export const supplierLogin = async (req, res) => {
  const { login, password } = req.body;

  login = login.trim();
  password = password.trim();

  // 1. Check if login and password exist
  if (!login || !password) {
    res.status(400).send({ message: 'Пожалуйста введите логин и пароль!' });
    return;
  }

  // 2. Find supplier in database
  const supplier = await Supplier.findWhereActive({ login });

  // 3. If user is not found
  if (!supplier) {
    res.status(400).send({ message: 'Данный поставщик не найден!' });
    return;
  }

  // 4. Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, supplier?.password || '');

  if (!isPasswordCorrect) {
    res.status(400).send({ message: 'Неверный пароль!' });
    return;
  }

  const { accessToken, refreshToken } = generateTokens(supplier.id);

  // 4. save refreshToken in DB
  const supplier_token = await SupplierToken.findWhere({ supplier_id: supplier.id });

  if (user_token) {
    await SupplierToken.updateWhere(
      { user_id: user.id },
      {
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
      }
    );
  } else {
    await SupplierToken.create({
      supplier_id: supplier.id,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
    });
  }

  // 5. send cookie
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    httpOnly: true, // Защищает от XSS атак
    sameSite: 'strict', // Защита от CSRF атак
    secure: process.env.NODE_ENV === 'production' // Только в производственной среде
  });

  // 6. make log about ip if ip not match
  // await Log.create({

  // });

  res.status(200).send({
    message: 'ok',
    supplier,
    accessToken
  });
};

export const supplierLogout = async (req, res) => {
  res.cookie('refreshToken', '', { maxAge: 0 });
  console.log('logout successfully');
  res.status(200).send({ message: 'ok' });
};

export const supplierRefresh = async (req, res) => {
  // 1. check for refreshToken
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).send({
      message: 'Произошла ошибка!, No refresh token!'
    });

  // 2. Try to decode refreshToken
  try {
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Check if user exist
    const supplier = await Supplier.find(decodedRefresh.supplierId);

    if (!supplier)
      return res.status(401).send({
        message: 'Поставщик не найден!'
      });

    // 4. if user exist and we get decodedRefresh, we generate JWT TOKEN
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
      supplier.id
    );

    // 5. save refreshToken in DB
    await SupplierToken.updateWhere(
      { supplier_id: supplier.id },
      {
        refresh_token: newRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
      }
    );

    // 6. send cookie
    res.cookie('refreshToken', newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      httpOnly: true, // Защищает от XSS атак
      sameSite: 'strict', // Защита от CSRF атак
      secure: process.env.NODE_ENV === 'production' // Только в производственной среде
    });

    res.status(200).send({
      message: 'ok',
      newAccessToken
    });
  } catch (err) {
    // session expired
    res.status(401).send({
      message: 'Сессия окончена!'
    });
  }
};
