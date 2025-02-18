async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        document.getElementById('coordinates').value = `${data.latitude},${data.longitude}`;
    } catch (error) {
        showError('自动定位失败，请手动输入坐标');
    }
}

async function getWeather() {
    const coordinates = document.getElementById('coordinates').value;
    const card = document.getElementById('weatherCard');
    const loading = card.querySelector('.loading');
    const content = card.querySelector('.weather-content');
    const errorDiv = card.querySelector('.error');

    loading.style.display = 'block';
    content.style.display = 'none';
    errorDiv.style.display = 'none';

    try {
        let url = '/api/weather';
        if (coordinates) {
            const [lat, lng] = coordinates.split(',');
            url += `?lat=${lat}&lng=${lng}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('天气数据获取失败');
        
        const data = await response.json();
        updateWeatherUI(data);
        
        loading.style.display = 'none';
        content.style.display = 'block';
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
    }
}

function updateWeatherUI(data) {
    document.getElementById('location').textContent = data.location;
    document.getElementById('temperature').innerHTML = `${data.temperature}&nbsp;℃`;
    document.getElementById('precip').textContent = data.precip + '%';
    document.getElementById('aqi').textContent = data.aqi;
    document.getElementById('wind').textContent = data.wind;
    document.getElementById('uv').textContent = data.uv;

    const icon = document.getElementById('weatherIcon');
    icon.className = 'weather-icon ' + getWeatherIcon(data.weatherCode);
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

function showError(message) {
    const errorDiv = document.getElementById('weatherCard').querySelector('.error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}
