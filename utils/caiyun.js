const axios = require('axios');
require('dotenv').config();

const WEATHER_EMOJIS = {
  'CLEAR_DAY': '☀️',
  'CLEAR_NIGHT': '🌙',
  'PARTLY_CLOUDY_DAY': '⛅',
  'PARTLY_CLOUDY_NIGHT': '☁️',
  'CLOUDY': '☁️',
  'RAIN': '🌧️',
  'SNOW': '❄️',
  'WIND': '🌪️',
  'FOG': '🌫️'
};

const getWeather = async ({ lng, lat }) => {
  const url = `https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/${lng},${lat}/weather?alert=true&dailysteps=7`;
  
  const response = await axios.get(url);
  const { result } = response.data;
  
  return {
    current: processCurrent(result),
    hourly: processHourly(result),
    daily: processDaily(result),
    alert: processAlert(result)
  };
};

// 处理当前天气数据
const processCurrent = (result) => ({
  temp: Math.round(result.realtime.temperature),
  feelsLike: Math.round(result.realtime.apparent_temperature),
  humidity: Math.round(result.realtime.humidity * 100),
  windSpeed: result.realtime.wind.speed.toFixed(1),
  pressure: result.realtime.pressure,
  skycon: result.realtime.skycon,
  emoji: WEATHER_EMOJIS[result.realtime.skycon] || '🌈',  // 新增这行
  description: result.realtime.description,
  airQuality: result.realtime.air_quality.aqi.chn
});

// 处理每小时数据（图表用）
const processHourly = (result) => ({
  temperature: result.hourly.temperature.slice(0, 24).map(item => Math.round(item.value)),
  time: result.hourly.temperature.slice(0, 24).map(item => 
    new Date(item.datetime)
      .toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: undefined, 
        hour12: false 
      })
      .replace(/:00$/, '')
  )
});

// 处理每日预报
const processDaily = (result) => ({
  forecast: result.daily.temperature.slice(0, 7).map((temp, index) => ({
    date: new Date(temp.date).toLocaleDateString(),
    maxTemp: Math.round(temp.max),
    minTemp: Math.round(temp.min),
    skycon: result.daily.skycon[index].value,
    emoji: WEATHER_EMOJIS[result.daily.skycon[index].value] || '🌈',  // 新增这行
    description: result.daily.skycon[index].desc
  }))
});

// 处理天气预警
const processAlert = (result) => {
  if (!result.alert || !result.alert.content) return null;
  return result.alert.content.map(alert => ({
    title: alert.title,
    description: alert.description
  }));
};

module.exports = { getWeather };