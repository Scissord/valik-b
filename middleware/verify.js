import jwt from 'jsonwebtoken';
import * as Supplier from '#models/supplier.js';
import * as User from '#models/user.js';

const verify = (entity) => async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token)
      return res.status(401).send({
        message: 'NO ACCESS TOKEN!'
      });

    const accessToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
          return res.status(401).send({
            message: 'NO REFRESH TOKEN!'
          });

        try {
          const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

          let entity;
          if (entity === 'supplier') {
            entity = await Supplier.find(decodedRefresh.supplierId);
          } else if (entity === 'user') {
            entity = await User.find(decodedRefresh.userId);
          }

          if (!entity) {
            return res.status(401).send({
              message: `${entity === 'supplier' ? 'Поставщик' : 'Пользователь'} не найден!`
            });
          }

          return res.status(401).send({
            message: 'Unauthorized - Invalid Access Token'
          });
        } catch (refreshError) {
          return res.status(401).send({
            message: 'Unauthorized - Invalid Refresh Token'
          });
        }
      } else {
        return res.status(401).send({
          message: 'Unauthorized - Invalid Access Token'
        });
      }
    }

    let role;
    if (entity === 'supplier') {
      role = await Supplier.find(decoded.supplierId);
    } else if (entity === 'user') {
      role = await User.find(decoded.userId);
    }

    if (!role)
      return res.status(401).send({
        message: `${entity === 'supplier' ? 'Поставщик' : 'Пользователь'} не найден!`
      });

    req[entity] = role;
    next();
  } catch (err) {
    console.log('Error in verify middleware', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export default verify;