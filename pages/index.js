import { useState } from 'react';
import axios from 'axios';
import TemperatureChart from '../components/TemperatureChart';
import WeatherAlert from '../components/WeatherAlert';
import WeatherCard from '../components/WeatherCard';
import { SunIcon, SearchIcon } from '@heroicons/react/outline';

const weatherStatus = {
  CLEAR_DAY: '晴天',
  CLEAR_NIGHT: '晴夜',
  PARTLY_CLOUDY_DAY: '多云',
  PARTLY_CLOUDY_NIGHT: '多云',
  CLOUDY: '阴',
  LIGHT_HAZE: '轻度雾霾',
  MODERATE_HAZE: '中度雾霾',
  HEAVY_HAZE: '重度雾霾',
  RAIN: '雨',
  SNOW: '雪',
};

export default function Home() {
  const [formData, setFormData] = useState({
    province: '',
    city: '',
    district: '',
    address: ''
  });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/weather', formData);
      setWeatherData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || '获取天气数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 头部搜索栏 */}
        <header className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                name="province"
                placeholder="省/直辖市"
                className="p-2 border rounded flex-1"
                required
                onChange={handleChange}
              />
              <input
                type="text"
                name="city"
                placeholder="市"
                className="p-2 border rounded flex-1"
                required
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                name="district"
                placeholder="区"
                className="p-2 border rounded flex-1"
                required
                onChange={handleChange}
              />
              <input
                type="text"
                name="address"
                placeholder="详细地址"
                className="p-2 border rounded flex-1"
                required
                onChange={handleChange}
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <SearchIcon className="w-5 h-5" />
              {loading ? '查询中...' : '查询天气'}
            </button>
          </form>
        </header>

        {/* 异常提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* 天气信息展示 */}
        {weatherData && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <SunIcon className="w-8 h-8 text-yellow-500" />
                {weatherData.location}当前天气
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <WeatherCard title="天气" value={weatherStatus[weatherData.current.skycon]} />
                <WeatherCard title="温度" value={`${weatherData.current.temperature}℃`} />
                <WeatherCard title="体感温度" value={`${weatherData.current.apparent_temperature}℃`} />
                <WeatherCard title="湿度" value={`${Math.round(weatherData.current.humidity * 100)}%`} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-semibold mb-4">未来24小时温度变化</h3>
              <TemperatureChart data={weatherData.hourly.temperature} />
            </div>

            <WeatherAlert alerts={weatherData.alert} />

          </div>
        )}
      </div>
    </div>
  );
}