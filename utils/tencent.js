const axios = require('axios');

exports.getLocationSuggestions = async (keyword) => {
    const response = await axios.get('https://apis.map.qq.com/ws/place/v1/suggestion', {
        params: {
            key: process.env.TENCENT_API_KEY,
            keyword: keyword,
            region: '全国'
        }
    });
    
    return response.data.data.map(item => ({
        title: item.title,
        address: item.address,
        lng: item.location.lng,
        lat: item.location.lat
    }));
};