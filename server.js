import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import compression from 'compression';
import routes from '#routes/index.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['POST', 'GET', 'PATCH', 'PUT', 'DELETE'],
    // origin: [
    //   'https://kazakhcrusader.store',
    //   'http://localhost:5173'
    // ],
    origin: '*',
    credentials: true
  })
);

app.use('', routes);
// error middleware

app.listen(PORT, () => {
  console.log(`Welcome to cv server, port ${PORT} ✅✅✅`);
});
