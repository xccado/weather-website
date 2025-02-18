import express from 'express';
import axios from 'axios';

const router = express.Router();

// 腾讯位置服务API
const geocode = async (address) => {
  const response = await axios.get('https://apis.map.qq.com/ws/geocoder/v1/', {
    params: {
      address: address,
      key: process.env.TENCENT_API_KEY
    }
  });
  return response.data.result.location;
};

// 通过IP获取位置
const getLocationByIP = async () => {
  const response = await axios.get('https://ipapi.co/json/');
  return {
    lng: response.data.longitude,
    lat: response.data.latitude,
    city: response.data.city
  };
};

// 彩云天气API
const getWeatherData = async (lng, lat) => {
  const response = await axios.get(`https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/${lng},${lat}/weather`, {
    params: {
      alert: true,
      dailysteps: 15
    }
  });
  return response.data;
};

router.get('/', async (req, res) => {
  try {
    const location = await getLocationByIP();
    res.redirect(`/weather?city=${encodeURIComponent(location.city)}`);
  } catch (error) {
    res.render('index', { error: '自动定位失败，请手动输入地址' });
  }
});

router.post('/weather', async (req, res) => {
  try {
    const location = await geocode(req.body.address);
    res.redirect(`/weather?lat=${location.lat}&lng=${location.lng}`);
  } catch (error) {
    res.render('index', { error: '地址解析失败，请重试' });
  }
});

router.get('/weather', async (req, res) => {
  try {
    const { lat, lng, city } = req.query;
    const weather = await getWeatherData(lng, lat);
    
    const emojiMap = {
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

    res.render('index', {
      location: city || req.body.address,
      current: {
        ...weather.result.realtime,
        emoji: emojiMap[weather.result.realtime.skycon] || '🌍'
      },
      alerts: weather.result.alert.content || [],
      daily: weather.result.daily,
      hourly: weather.result.hourly,
      emojiMap
    });
  } catch (error) {
    res.render('index', { error: '获取天气信息失败' });
  }
});

export default router;