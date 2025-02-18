export default async (req, res) => {
    const { lat, lng } = req.query;
    const API_KEY = process.env.CAIYUN_API_KEY;
    
    try {
        const response = await fetch(`https://api.caiyunapp.com/v2.6/${API_KEY}/${lng},${lat}/realtime?lang=zh_CN`);
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error('天气API请求失败');
        }
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};