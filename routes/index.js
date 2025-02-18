const express = require('express');
const router = express.Router();
const { getCoordinates } = require('../utils/tencent');
const { getWeather } = require('../utils/caiyun');

router.get('/', (req, res) => {
  res.render('index', { weather: null, error: null });
});

router.post('/', async (req, res) => {
  try {
    const { location } = req.body;
    const coords = await getCoordinates(location);
    const weather = await getWeather(coords);
    res.render('index', { weather, error: null });
  } catch (error) {
    res.render('index', { 
      weather: null,
      error: '获取天气数据失败，请检查位置输入是否正确'
    });
  }
});

module.exports = router;