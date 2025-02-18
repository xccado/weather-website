const fetch = require('node-fetch');

function getWindDirection(degree) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round((degree % 360) / 45) % 8;
    return directions[index];
}

module.exports = async (req, res) => {
    try {
        let { lat, lng } = req.query;
        
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
        
        const weatherMap = {
            0: '晴', 1: '多云', 2: '阴', 3: '阵雨', 4: '雷阵雨', 5: '雪'
        };

        const result = {
            location: data.result.forecast_keypoint,
            temperature: data.result.realtime.temperature.toFixed(1),
            weatherCode: data.result.realtime.skycon,
            weather: weatherMap[data.result.realtime.skycon] || '未知',
            humidity: (data.result.realtime.humidity * 100).toFixed(0),
            precip: (data.result.realtime.precipitation.local.intensity * 100).toFixed(0),
            aqi: data.result.realtime.air_quality.description.chn,
            wind: `${data.result.realtime.wind.speed.toFixed(1)} km/h`,
            uv: data.result.realtime.life_index.ultraviolet.desc,
            pressure: data.result.realtime.pres.toFixed(1),
            windDirection: getWindDirection(data.result.realtime.wind.direction),
            visibility: (data.result.realtime.visibility / 1000).toFixed(1) + 'km',
            hourly: data.result.hourly.temperature
                .slice(0, 24)
                .map(({ datetime, value }) => ({
                    time: datetime,
                    temp: value
                }))
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};