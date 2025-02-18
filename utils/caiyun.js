const axios = require('axios');

exports.getCaiyunWeather = async (lng, lat) => {
    const response = await axios.get(`https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/${lng},${lat}/weather`, {
        params: {
            alert: true,
            dailysteps: 15,
            hourlysteps: 24
        }
    });

    const data = response.data.result;
    
    // 处理天气数据为中文
    return {
        realtime: processRealtime(data.realtime),
        hourly: processHourly(data.hourly),
        daily: processDaily(data.daily),
        alert: processAlert(data.alert)
    };
};

// 数据处理函数（由于篇幅限制，这里展示关键处理逻辑）
function processRealtime(realtime) {
    return {
        temperature: `${realtime.temperature}℃`,
        humidity: `${(realtime.humidity * 100).toFixed(0)}%`,
        precipitation: `${realtime.precipitation.local.intensity}mm/h`,
        wind: `${windDirection(realtime.wind.direction)} ${realtime.wind.speed}m/s`
    };
}

function windDirection(degree) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    return directions[Math.round(degree / 45) % 8];
}