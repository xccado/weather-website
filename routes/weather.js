const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getCaiyunWeather } = require('../utils/caiyun');
const { getLocationSuggestions } = require('../utils/tencent');

// 获取位置建议
router.post('/suggest', async (req, res) => {
    try {
        const suggestions = await getLocationSuggestions(req.body.location);
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: '获取位置信息失败' });
    }
});

// 获取天气数据
router.post('/data', async (req, res) => {
    try {
        const { lng, lat } = req.body;
        const weatherData = await getCaiyunWeather(lng, lat);
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: '获取天气数据失败' });
    }
});

module.exports = router;