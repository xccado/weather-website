import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import dotenv from 'dotenv';
import weatherRouter from './routes/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// 视图引擎配置
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 中间件
app.use(express.static(join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/', weatherRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});