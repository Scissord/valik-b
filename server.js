import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from '#routes/index.js';
import initTelegramBot from '#utils/initTelegramBot.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      // 'http://localhost:5173'
      // '*',
      "https://valik.kz",
      "https://supplier.valik.kz"
    ],
    credentials: true
  })
);

app.use('', routes);
// error middleware

app.listen(PORT, () => {
  console.log(`Welcome to cv server, port ${PORT} ✅✅✅`);
  
  // Инициализируем Telegram бота
  initTelegramBot();
});
