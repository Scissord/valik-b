import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as User from '#models/user.js';
import * as UserToken from '#models/user_token.js';
import generateTokens from '#utils/tokens/generateUserTokens.js';

export const userLogin = async (req, res) => {
  let { login, password } = req.body;

  login = login.trim();
  password = password.trim();

  // 1. Check if login and password exist
  if (!login || !password) {
    res.status(400).send({ message: 'Пожалуйста введите логин и пароль!' });
    return;
  }

  // 2. Find user in database
  const query = { login };
  const query2 = { email: login };
  let user = await User.findWhereActive(query);

  // 3. If user is not found
  if (!user) {
    user = await User.findWhereActive(query2);
  }

  if (!user) {
    res.status(400).send({ message: 'Данный пользователь не найден!' });
    return;
  }

  // 4. Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user?.password || '');

  if (!isPasswordCorrect) {
    res.status(400).send({ message: 'Неверный пароль!' });
    return;
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  // 4. save refreshToken in DB
  const user_token = await UserToken.findWhere({ user_id: user.id });
  const expires_at = Math.floor(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (user_token) {
    await UserToken.updateWhere(
      { user_id: user.id },
      {
        refresh_token: refreshToken,
        expires_at
      }
    );
  } else {
    await UserToken.create({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at
    });
  }

  // 5. send cookie
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    httpOnly: true, // Защищает от XSS атак
    // sameSite: 'strict', // Защита от CSRF атак
    sameSite: 'lax', // Защита от CSRF атак
    // secure: process.env.NODE_ENV === 'production' // Только в производственной среде
    secure: false
  });

  // 6. make log about ip if ip not match
  // await Log.create({

  // });

  res.status(200).send({
    message: 'ok',
    user,
    accessToken
  });
};

export const userRegistration = async (req, res) => {
  const data = req.body;

  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);

  const user = await User.create(data);
  delete user.password;

  const { accessToken, refreshToken } = generateTokens(user.id);

  const user_token = await UserToken.findWhere({ user_id: user.id });

  const expires_at = Math.floor(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (user_token) {
    await UserToken.updateWhere(
      { user_id: user.id },
      {
        refresh_token: refreshToken,
        expires_at
      }
    );
  } else {
    await UserToken.create({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_at
    });
  }

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    httpOnly: true, // Защищает от XSS атак
    sameSite: 'strict', // Защита от CSRF атак
    secure: process.env.NODE_ENV === 'production' // Только в производственной среде
  });

  res.status(200).send({
    message: 'User created successfully',
    accessToken,
    user
  });
};

export const userLogout = async (req, res) => {
  res.cookie('refreshToken', '', { maxAge: 0 });
  console.log('logout successfully');
  res.status(200).send({ message: 'Successfully logout' });
};

export const userRefresh = async (req, res) => {
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
    const user = await User.find(decodedRefresh.userId);

    if (!user)
      return res.status(401).send({
        message: 'Поставщик не найден!'
      });

    // 4. if user exist and we get decodedRefresh, we generate JWT TOKEN
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    const expires_at = Math.floor(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // 5. save refreshToken in DB
    await UserToken.updateWhere(
      { user_id: user.id },
      {
        refresh_token: newRefreshToken,
        expires_at
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
