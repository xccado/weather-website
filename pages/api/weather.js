import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { province, city, district, address } = req.body;
  
  try {
    // Step 1: 获取经纬度
    const locationRes = await axios.get(
      `https://apis.map.qq.com/ws/geocoder/v1/`,
      {
        params: {
          address: `${province}${city}${district}${address}`,
          key: process.env.TENCENT_API_KEY
        }
      }
    );

    if (locationRes.data.status !== 0) {
      throw new Error('地址解析失败');
    }
    
    const { lat, lng } = locationRes.data.result.location;

    // Step 2: 获取天气数据
    const weatherRes = await axios.get(
      `https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/${lng},${lat}/weather`,
      {
        params: {
          alert: true,
          daily: '4',
          hourly: '24'
        }
      }
    );

    // 数据处理
    const result = {
      location: locationRes.data.result.title,
      current: weatherRes.data.result.realtime,
      daily: weatherRes.data.result.daily,
      alert: weatherRes.data.result.alert,
      hourly: weatherRes.data.result.hourly
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || '服务器错误' });
  }
}