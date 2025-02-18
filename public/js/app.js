document.addEventListener('DOMContentLoaded', () => {
    const chartCtx = document.getElementById('temperatureChart').getContext('2d');
    let weatherChart;

    // 自动获取IP位置
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('locationInput').value = `${data.city}，${data.region}，${data.country_name}`;
        });

    // 输入建议
    document.getElementById('locationInput').addEventListener('input', async (e) => {
        const response = await fetch('/weather/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `location=${encodeURIComponent(e.target.value)}`
        });
        
        const suggestions = await response.json();
        showSuggestions(suggestions);
    });

    // 获取天气数据
    window.getWeather = async (lng, lat) => {
        const response = await fetch('/weather/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lng, lat })
        });
        
        const weatherData = await response.json();
        updateWeatherDisplay(weatherData);
    };

    function updateWeatherDisplay(data) {
        // 更新实时天气
        document.getElementById('realtimeInfo').innerHTML = `
            <p>温度：${data.realtime.temperature}</p>
            <p>湿度：${data.realtime.humidity}</p>
            <p>降水量：${data.realtime.precipitation}</p>
            <p>风速：${data.realtime.wind}</p>
        `;

        // 绘制温度图表
        if (weatherChart) weatherChart.destroy();
        weatherChart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.hourly.temperature.map((_, i) => `${i}时`),
                datasets: [{
                    label: '温度变化',
                    data: data.hourly.temperature,
                    borderColor: '#ff6384',
                    tension: 0.1
                }]
            }
        });

        // 显示天气预报
        document.getElementById('dailyForecast').innerHTML = data.daily.map(day => `
            <div class="day-forecast">
                <h5>${day.date}</h5>
                <p>最高温度：${day.temp.max}℃</p>
                <p>最低温度：${day.temp.min}℃</p>
            </div>
        `).join('');

        // 显示预警信息
        document.getElementById('weatherAlerts').innerHTML = data.alert.content || '当前无气象预警';
    }
});