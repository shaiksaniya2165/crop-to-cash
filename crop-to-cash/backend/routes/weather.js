const express = require('express');
const router = express.Router();
const axios = require('axios');

// City-specific weather profiles so every city returns different data
const CITY_PROFILES = {
  'Guntur':        { baseTemp: 33, humidity: 74, wind: 14, pattern: [0,1,2,3,1,0,4] },
  'Vijayawada':    { baseTemp: 34, humidity: 70, wind: 16, pattern: [0,0,1,2,3,1,0] },
  'Visakhapatnam': { baseTemp: 30, humidity: 82, wind: 20, pattern: [2,3,4,3,1,0,1] },
  'Nellore':       { baseTemp: 35, humidity: 68, wind: 12, pattern: [0,1,0,2,3,4,1] },
  'Kurnool':       { baseTemp: 36, humidity: 60, wind: 10, pattern: [0,0,0,1,2,1,0] },
  'Warangal':      { baseTemp: 32, humidity: 72, wind: 13, pattern: [1,2,3,2,1,0,0] },
  'Hyderabad':     { baseTemp: 31, humidity: 66, wind: 15, pattern: [1,1,2,3,2,1,0] },
  'Tirupati':      { baseTemp: 29, humidity: 78, wind: 11, pattern: [2,3,4,3,2,1,0] },
};

const WEATHER_DATA = [
  { icon: '☀️',  desc: 'Sunny',         descTE: 'సన్నీ',           rain: 5  },
  { icon: '⛅',  desc: 'Partly Cloudy', descTE: 'పాక్షికంగా మేఘాలు', rain: 20 },
  { icon: '🌤️', desc: 'Clear Sky',     descTE: 'స్వచ్ఛమైన ఆకాశం',  rain: 10 },
  { icon: '🌦️', desc: 'Light Rain',    descTE: 'తేలికపాటి వర్షం',  rain: 65 },
  { icon: '🌧️', desc: 'Heavy Rain',    descTE: 'భారీ వర్షం',       rain: 90 },
];

const DAY_NAMES_EN = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_TE = ['నేడు', 'రేపు', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం', 'ఆదివారం'];

router.get('/', async (req, res) => {
  try {
    const { lat = 16.3067, lon = 80.4365, city = 'Guntur' } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (apiKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        // Parse real OpenWeather response
        const list = response.data.list;
        const currentRaw = list[0];
        const current = {
          temp: Math.round(currentRaw.main.temp),
          feels_like: Math.round(currentRaw.main.feels_like),
          humidity: currentRaw.main.humidity,
          wind_speed: Math.round(currentRaw.wind.speed * 3.6),
          description: currentRaw.weather[0].description,
          icon: getOWIcon(currentRaw.weather[0].icon),
          pressure: currentRaw.main.pressure
        };
        // Group by day
        const dayMap = {};
        list.forEach(item => {
          const d = item.dt_txt.split(' ')[0];
          if (!dayMap[d]) dayMap[d] = [];
          dayMap[d].push(item);
        });
        const forecast = Object.entries(dayMap).slice(0, 7).map(([date, items], i) => {
          const temps = items.map(x => x.main.temp);
          const mainItem = items[Math.floor(items.length / 2)];
          return {
            day: DAY_NAMES_EN[i],
            dayTE: DAY_NAMES_TE[i],
            date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            temp_max: Math.round(Math.max(...temps)),
            temp_min: Math.round(Math.min(...temps)),
            description: mainItem.weather[0].description,
            descriptionTE: mainItem.weather[0].description,
            icon: getOWIcon(mainItem.weather[0].icon),
            humidity: mainItem.main.humidity,
            wind: Math.round(mainItem.wind.speed * 3.6),
            rain_chance: Math.round((mainItem.pop || 0) * 100)
          };
        });
        return res.json({ city: { name: city }, mock: false, current, forecast });
      } catch (apiErr) {
        console.log('OWM API error, using mock:', apiErr.message);
      }
    }

    // Mock with city-specific data
    return res.json(getMockWeather(city));
  } catch (err) {
    res.json(getMockWeather(req.query.city || 'Guntur'));
  }
});

function getMockWeather(city) {
  const profile = CITY_PROFILES[city] || CITY_PROFILES['Guntur'];
  const baseTemp = profile.baseTemp;
  const todayPattern = profile.pattern[0];
  const todayWD = WEATHER_DATA[todayPattern];

  const current = {
    temp: baseTemp + Math.round((Math.random() - 0.5) * 3),
    feels_like: baseTemp + 3 + Math.round((Math.random() - 0.5) * 2),
    humidity: profile.humidity + Math.round((Math.random() - 0.5) * 8),
    wind_speed: profile.wind + Math.round((Math.random() - 0.5) * 4),
    description: todayWD.desc,
    descriptionTE: todayWD.descTE,
    icon: todayWD.icon,
    pressure: 1005 + Math.round(Math.random() * 8)
  };

  const forecast = profile.pattern.map((patIdx, i) => {
    const wd = WEATHER_DATA[patIdx];
    // Each city gets unique temp variation
    const tempVariation = Math.round((Math.sin(i + profile.baseTemp) * 3));
    return {
      day: DAY_NAMES_EN[i],
      dayTE: DAY_NAMES_TE[i],
      date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      temp_max: baseTemp + tempVariation + Math.round(Math.random() * 2),
      temp_min: baseTemp - 6 + tempVariation + Math.round(Math.random() * 2),
      description: wd.desc,
      descriptionTE: wd.descTE,
      icon: wd.icon,
      humidity: profile.humidity + Math.round((Math.random() - 0.5) * 12),
      wind: profile.wind + Math.round((Math.random() - 0.5) * 6),
      rain_chance: wd.rain + Math.round((Math.random() - 0.5) * 10)
    };
  });

  return { city: { name: city }, mock: true, current, forecast };
}

function getOWIcon(iconCode) {
  const map = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return map[iconCode] || '🌤️';
}

module.exports = router;
