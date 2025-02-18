const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        let { lat, lng } = req.query;
        
        // 如果没有坐标参数，通过IP获取位置
        if (!lat || !lng) {
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData = await ipResponse.json();
            lat = ipData.latitude;
            lng = ipData.longitude;
        }

        const apiKey = process.env.CY_API_KEY || 'U530NtlN6MPplrwS';
        const url = `https://api.caiyunapp.com/v2.6/${apiKey}/${lng},${lat}/weather?alert=true`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('天气API请求失败');
        
        const data = await response.json();
        
        // 天气代码到中文的映射
        const weatherMap = {
            0: '晴',
            1: '多云',
            2: '阴',
            3: '阵雨',
            4: '雷阵雨',
            5: '雪'
        };

        // 构造响应数据
        const result = {
            location: data.result.forecast_keypoint,
            temperature: data.result.realtime.temperature.toFixed(1),
            weatherCode: data.result.realtime.skycon,
            weather: weatherMap[data.result.realtime.skycon] || '未知',
            precip: (data.result.realtime.precipitation.local.intensity * 100).toFixed(0),
            aqi: data.result.realtime.air_quality.description.chn,
            wind: `${data.result.realtime.wind.speed.toFixed(1)} km/h (${data.result.realtime.wind.direction}°)`,
            uv: data.result.realtime.life_index.ultraviolet.desc
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};