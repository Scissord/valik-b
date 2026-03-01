import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import routes from '#routes/index.js';
import initTelegramBot from '#utils/initTelegramBot.js';

const app = express();
const PORT = process.env.PORT || 8080;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Valik API',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:8080' },
      { url: 'https://valik.kz' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js']
});

app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      // for development supplier
      'http://localhost:5173',
      // for prebuild preview supplier
      'http://localhost:4173',
      // for development frontend
      'http://localhost:3000',
      'http://194.32.141.143',
      // main site
      'https://valik.kz',
      'https://www.valik.kz',
      // main site for supplier
      'https://supplier.valik.kz',
      'https://www.supplier.valik.kz'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('', routes);
// error middleware

app.listen(PORT, () => {
  console.log(`Welcome to cv server, port ${PORT} ✅✅✅`);

  // Инициализируем Telegram бота
  initTelegramBot();
});
