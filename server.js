import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from '#routes/index.js';

const app = express();
const PORT = process.env.PORT || 8080;

// app.use(compression());
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//     crossOriginEmbedderPolicy: false
//   })
// );
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      // 'http://localhost:3000'
    ],
    origin: 'http://localhost:3000',
    credentials: true
  })
);

app.use('', routes);
// error middleware

app.listen(PORT, () => {
  console.log(`Welcome to cv server, port ${PORT} ✅✅✅`);
});
