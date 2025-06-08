import jwt from 'jsonwebtoken';
import * as Supplier from '#models/supplier.js';

const verifySupplier = async (req, res, next) => {
  // 401 - refresh access and refresh tokens, or throw away user from app
  try {
    // 1. Make sure you have accessToken;
    const token = req.headers['authorization'];
    if (!token)
      return res.status(401).send({
        message: 'NO ACCESS TOKEN!'
      });

    // 2. Delete Bearer
    const accessToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // 3. Try to decode token
    let decoded;
    try {
      // 4. If ok continue;
      decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      // 5. Else mean accessToken is expired
      if (err.name === 'TokenExpiredError') {
        // 6. Taking refreshToken from cookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
          return res.status(401).send({
            message: 'NO REFRESH TOKEN!'
          });

        try {
          // 7. Try to decode refreshToken
          const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

          // 8. Check if user exist
          const supplier = await Supplier.find(decodedRefresh.supplierId);
          if (!supplier) {
            return res.status(401).send({
              message: 'Поставщик не найден!'
            });
          }

          // 9. refreshToken is valid, but need new accessToken
          return res.status(401).send({
            message: 'Unauthorized - Invalid Access Token'
          });
        } catch (refreshError) {
          // 10. If refreshToken invalid too
          return res.status(401).send({
            message: 'Unauthorized - Invalid Refresh Token'
          });
        }
      } else {
        // 11. If token is not expired, but other error
        return res.status(401).send({
          message: 'Unauthorized - Invalid Access Token'
        });
      }
    }

    const supplier = await Supplier.find(decoded.supplierId);

    if (!supplier)
      return res.status(401).send({
        message: 'Поставщик не найден!'
      });

    req.supplier = supplier;

    next();
  } catch (err) {
    console.log('Error in verify middleware', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export default verifySupplier;
