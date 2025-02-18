require('dotenv').config();
const express = require('express');
const path = require('path'); // 新增path模块
const app = express();

// 新增视图路径配置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'))); // 更新静态文件路径
app.use(express.urlencoded({ extended: true }));

// 路由配置保持不变
app.use('/', require('./routes/index'));
app.use('/weather', require('./routes/weather'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));