const fetch = require('node-fetch');

// 调试模式开关
const DEBUG_MODE = process.env.DEBUG === 'true';

// 增强型地理编码
async function geocodeAddress(address) {
    try {
        const TENCENT_KEY = process.env.TENCENT_MAP_KEY;
        if (!TENCENT_KEY || TENCENT_KEY.length !== 24) {
            throw new Error('腾讯位置服务密钥未正确配置');
        }

        const encodedAddress = encodeURIComponent(address);
        const url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodedAddress}&key=${TENCENT_KEY}`;
        
        DEBUG_MODE && console.log('Requesting Tencent API:', url);
        const response = await fetch(url);
        const data = await response.json();
        DEBUG_MODE && console.log('Tencent API Response:', JSON.stringify(data));

        if (data.status !== 0) {
            throw new Error(`腾讯地址解析失败 (Code${data.status}): ${data.message}`);
        }

        const { lng, lat } = data.result.location || {};
        if (!isValidCoordinate(lat, lng)) {
            throw new Error('获取到无效的经纬度坐标');
        }

        return { lat, lng };
    } catch (error) {
        console.error('地理编码错误:', error.message);
        throw new Error(`地址解析失败：${error.message}`);
    }
}

// 增强型天气数据获取
async function getCaiyunWeather(lng, lat) {
    try {
        const CY_KEY = process.env.CY_API_KEY;
        if (!CY_KEY || CY_KEY.length !== 16) {
            throw new Error('彩云天气密钥未正确配置');
        }

        const url = `https://api.caiyunapp.com/v2.6/${CY_KEY}/${lng},${lat}/weather?alert=true`;
        DEBUG_MODE && console.log('Requesting Caiyun API:', url);
        const response = await fetch(url);
        const data = await response.json();
        DEBUG_MODE && console.log('Caiyun API Response Status:', data.status);

        if (data.status !== 'ok') {
            throw new Error(`彩云天气API错误: ${data.error || '未知错误'}`);
        }

        return data;
    } catch (error) {
        console.error('获取天气数据失败:', error.message);
        throw new Error(`天气服务不可用：${error.message}`);
    }
}

// 工具函数
function isValidCoordinate(lat, lng) {
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function getWeatherInfo(skycon) {
    const weatherMap = {
        CLEAR_DAY:     { text: '晴',    code: 0, icon: 'sun' },
        CLEAR_NIGHT:   { text: '晴夜',  code: 0, icon: 'moon' },
        PARTLY_CLOUDY_DAY: { text: '多云',  code: 1, icon: 'cloud-sun' },
        PARTLY_CLOUDY_NIGHT: { text: '多云', code: 1, icon: 'cloud-moon' },
        CLOUDY:        { text: '阴',    code: 2, icon: 'cloud' },
        LIGHT_RAIN:    { text: '小雨',  code: 3, icon: 'cloud-rain' },
        MODERATE_RAIN: { text: '中雨',  code: 3, icon: 'cloud-showers-heavy' },
        HEAVY_RAIN:    { text: '大雨',  code: 3, icon: 'cloud-showers-water' },
        STORM_RAIN:    { text: '暴雨',  code: 3, icon: 'cloud-showers-water' },
        LIGHT_SNOW:    { text: '小雪',  code: 5, icon: 'snowflake' },
        MODERATE_SNOW: { text: '中雪',  code: 5, icon: 'snowflake' },
        HEAVY_SNOW:    { text: '大雪',  code: 5, icon: 'snowman' },
        STORM_SNOW:    { text: '暴雪',  code: 5, icon: 'snowman' },
        // 其他状态参考彩云天气文档
        default:       { text: '未知',  code: -1, icon: 'question' }
    };

    return weatherMap[skycon] || weatherMap.default;
}

function processWeatherData(data) {
    const realtime = data.result?.realtime || {};
    const hourlyTemp = data.result?.hourly?.temperature?.slice(0, 24) || [];
    
    return {
        location: data.result?.forecast_keypoint || '未知位置',
        temperature: realtime.temperature?.toFixed(1) ?? '--',
        humidity: Math.round((realtime.humidity ?? 0) * 100),
        precipitation: {
            probability: Math.round((realtime.precipitation?.probability ?? 0) * 100),
            intensity: Math.round((realtime.precipitation?.local?.intensity ?? 0) * 100)
        },
        aqi: realtime.air_quality?.description?.chn || '未知',
        wind: {
            speed: (realtime.wind?.speed ?? 0).toFixed(1),
            direction: realtime.wind?.direction ?? 0
        },
        uv: realtime.life_index?.ultraviolet?.desc || '未知',
        pressure: (realtime.pres / 100).toFixed(1), // 转换为hPa
        visibility: (realtime.visibility / 1000).toFixed(1),
        hourly: hourlyTemp.map(item => ({
            time: item.datetime,
            temp: item.value
        })),
        ...getWeatherInfo(realtime.skycon)
    };
}

module.exports = async (req, res) => {
    const startTime = Date.now();
    
    try {
        console.log('[Request] Query:', req.query);
        console.log('[Env] CY_KEY Length:', process.env.CY_API_KEY?.length);
        console.log('[Env] TENCENT_KEY Length:', process.env.TENCENT_MAP_KEY?.length);

        // 参数处理
        let { lat, lng, address } = req.query;
        
        // 地址优先处理
        if (address) {
            const location = await geocodeAddress(address);
            lat = location.lat;
            lng = location.lng;
        } 
        // 自动定位处理
        else if (!lat || !lng) {
            console.log('Autolocation triggered');
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            lat = ipData.latitude;
            lng = ipData.longitude;
        }

        // 最终坐标验证
        if (!isValidCoordinate(lat, lng)) {
            throw new Error(`无效坐标：lat=${lat}, lng=${lng}`);
        }

        // 获取天气数据
        const rawData = await getCaiyunWeather(lng, lat);
        const processedData = processWeatherData(rawData);

        // 成功响应
        res.status(200).json({
            status: 'success',
            ...processedData,
            coordinates: { lat, lng },
            timestamp: Date.now()
        });

    } catch (error) {
        console.error(`[Error] ${req.method} ${req.url}`, {
            error: error.stack,
            params: req.query,
            duration: Date.now() - startTime + 'ms'
        });

        res.status(500).json({
            status: 'error',
            message: error.message,
            suggestion: error.suggestion || '请检查：1.输入格式 2.服务可用性 3.密钥配置'
        });
    }
};