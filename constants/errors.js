// 400 - error with message to show to client
// 401 - access token expired need to refresh
// 402 - no token provided or refreshToken expired, need to throw away user from system

const ERRORS = {
  // auth
  INVALID_CREDENTIALS: 'Неверно введенные данные!',
  USER_NOT_FOUND: 'Пользователь не найден!',
  INVALID_PASSWORD: 'Неверный пароль!',
  // tokens
  TOKEN_EXPIRED: 'TokenExpiredError',
  NO_ACCESS: 'Unauthorized - No Token Provided',
  INVALID_ACCESS: 'Unauthorized - Invalid Access Token',
  NO_REFRESH: 'Unauthorized - No Refresh Token Provided',
  INVALID_REFRESH: 'Unauthorized - Invalid Refresh Token',
  SESSION_EXPIRED: 'Сессия истекла. Пожалуйста, войдите заново',
  USER_CANT: 'Пользователь не может выполнить это действие!',
  // orders
  NO_REQUEST_ID: 'Укажите номер заявки!',
  NO_ORDER_ID: 'Укажите номер заказа!',
  NO_CLIENT_ID: 'Выберите клиента!',
  NO_MANAGER_ID: 'Выберите менеджера!',
  NO_PAYMENT_METHOD_ID: 'Выберите способ оплаты!'
};

export default ERRORS;
