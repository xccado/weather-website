const axios = require('axios');
require('dotenv').config();

const getCoordinates = async (location) => {
  const url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(location)}&key=${process.env.TENCENT_API_KEY}`;
  
  const response = await axios.get(url);
  if (response.data.status !== 0) {
    throw new Error('位置解析失败');
  }
  
  return {
    lng: response.data.result.location.lng,
    lat: response.data.result.location.lat
  };
};

module.exports = { getCoordinates };