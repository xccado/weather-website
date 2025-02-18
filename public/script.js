async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        document.getElementById('coordinates').value = `${data.latitude},${data.longitude}`;
    } catch (error) {
        showError('自动定位失败，请手动输入坐标');
    }
}

function validateCoordinates(input) {
    const coordPattern = /^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;
    if (!input) return true;
    
    if (!coordPattern.test(input)) {
        showError('请输入有效的经纬度格式（例：39.9042,116.4074）');
        document.getElementById('coordinates').classList.add('input-error');
        setTimeout(() => {
            document.getElementById('coordinates').classList.remove('input-error');
        }, 2000);
        return false;
    }
    
    const [lat, lng] = input.split(',').map(Number);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        showError('纬度范围：-90~90，经度范围：-180~180');
        return false;
    }
    
    return true;
}

async function getWeather() {
    const input = document.getElementById('coordinates').value;
    if (!validateCoordinates(input)) return;
    
    const card = document.getElementById('weatherCard');
    const errorDiv = card.querySelector('.error');
    
    if (window.tempChart) window.tempChart.destroy();
    toggleLoading(true);
    errorDiv.style.display = 'none';

    try {
        let url = '/api/weather';
        if (input) {
            const [lat, lng] = input.split(',');
            url += `?lat=${lat}&lng=${lng}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('天气数据获取失败');
        
        const data = await response.json();
        updateWeatherUI(data);
        renderTemperatureChart(data.hourly);
        
    } catch (error) {
        showError(error.message);
    } finally {
        toggleLoading(false);
    }
}

function toggleLoading(show) {
    const loader = document.querySelector('.loading-animation');
    const content = card.querySelector('.weather-content');
    loader.style.display = show ? 'flex' : 'none';
    content.style.display = show ? 'none' : 'block';
}

function updateWeatherUI(data) {
    document.getElementById('location').textContent = data.location;
    document.getElementById('temperature').innerHTML = `${data.temperature}&nbsp;℃`;
    document.getElementById('humidity').textContent = data.humidity;
    document.getElementById('aqi').textContent = data.aqi;
    document.getElementById('wind').textContent = data.wind;
    document.getElementById('uv').textContent = data.uv;
    document.getElementById('windDirection').textContent = data.windDirection;
    document.getElementById('pressure').textContent = data.pressure;
    document.getElementById('visibility').textContent = data.visibility;

    const icon = document.getElementById('weatherIcon');
    icon.className = 'weather-icon ' + getWeatherIcon(data.weatherCode);
    
    document.body.style.background = getBackgroundByWeather(data.weatherCode);
}

function getWeatherIcon(code) {
    const icons = {
        0: 'fas fa-sun',
        1: 'fas fa-cloud-sun',
        2: 'fas fa-cloud',
        3: 'fas fa-cloud-showers-heavy',
        4: 'fas fa-bolt',
        5: 'fas fa-snowflake',
        6: 'fas fa-smog'
    };
    return icons[code] || 'fas fa-question';
}

function renderTemperatureChart(hourlyData) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyData.map((_, i) => `${i}:00`),
            datasets: [{
                label: '温度趋势 (°C)',
                data: hourlyData.map(d => d.temp),
                borderColor: '#00b4d8',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(0,180,216,0.2)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#fff' } }
            },
            scales: {
                x: { 
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#fff' }
                },
                y: { 
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#fff' }
                }
            }
        }
    });
}

function getBackgroundByWeather(code) {
    const gradients = {
        0: 'linear-gradient(135deg, #ffe259, #ffa751)',
        1: 'linear-gradient(135deg, #a8c0ff, #3f2b96)',
        2: 'linear-gradient(135deg, #636363, #a2ab58)',
        3: 'linear-gradient(135deg, #0093E9, #80D0C7)',
        4: 'linear-gradient(135deg, #616161, #9bc5c3)',
        5: 'linear-gradient(135deg, #89f7fe, #66a6ff)'
    };
    return gradients[code] || 'linear-gradient(135deg, #1e3c72, #2a5298)';
}

function showError(message) {
    const errorDiv = document.getElementById('weatherCard').querySelector('.error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}