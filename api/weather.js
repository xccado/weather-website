const fetch = require('node-fetch');
console.log('环境变量验证:');
console.log('彩云密钥长度:', process.env.CY_API_KEY?.length || '未设置');
console.log('腾讯密钥长度:', process.env.TENCENT_MAP_KEY?.length || '未设置');
async function geocodeAddress(address) {
    const TENCENT_KEY = process.env.TENCENT_MAP_KEY;
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${TENCENT_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 0 || !data.result?.location) {
        throw new Error('地址解析失败');
    }
    return data.result.location;
}

function getWindDirection(degree) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round((degree % 360) / 45) % 8;
    return directions[index];
}

module.exports = async (req, res) => {
    try {
        let { lat, lng, address } = req.query;
        
        // 地址优先级最高
        if (address) {
            const location = await geocodeAddress(address);
            lat = location.lat;
            lng = location.lng;
        } 
        // 次选直接坐标查询
        else if (!lat || !lng) { 
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData = await ipResponse.json();
            lat = ipData.latitude;
            lng = ipData.longitude;
        }

        const apiKey = process.env.CY_API_KEY;
        const url = `https://api.caiyunapp.com/v2.6/${apiKey}/${lng},${lat}/weather`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('天气API请求失败');
        
        const data = await response.json();

        const weatherMap = {
            CLEAR_DAY: ['晴', 0],
            PARTLY_CLOUDY_DAY: ['多云', 1],
            CLOUDY: ['阴', 2],
            RAIN: ['雨', 3],
            SNOW: ['雪', 5]
        };

        const result = {
            location: data.result.forecast_keypoint,
            temperature: data.result.realtime.temperature.toFixed(1),
            weatherCode: weatherMap[data.result.realtime.skycon][1],
            weather: weatherMap[data.result.realtime.skycon][0],
            humidity: (data.result.realtime.humidity * 100).toFixed(0),
            precip: (data.result.realtime.precipitation.local.intensity * 100).toFixed(0),
            aqi: data.result.realtime.air_quality.description.chn,
            wind: `${data.result.realtime.wind.speed.toFixed(1)} km/h`,
            uv: data.result.realtime.life_index.ultraviolet.desc,
            pressure: data.result.realtime.pres.toFixed(1),
            windDirection: getWindDirection(data.result.realtime.wind.direction),
            visibility: `${(data.result.realtime.visibility / 1000).toFixed(1)} km`,
            hourly: data.result.hourly.temperature.slice(0, 24)
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            suggestion: '请确认：1.输入格式正确 2.服务密钥有效'
        });
    }
};