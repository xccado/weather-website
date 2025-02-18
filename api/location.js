export default async (req, res) => {
    const { address } = req.query;
    const API_KEY = process.env.TENCENT_API_KEY;
    
    try {
        const response = await fetch(
            `https://apis.map.qq.com/ws/geocoder/v1/?address=${address}&key=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.status !== 0) {
            throw new Error('位置查询失败');
        }
        
        res.status(200).json({
            lat: data.result.location.lat,
            lng: data.result.location.lng
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};