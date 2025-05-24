import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/WeatherPage.css';

const cities = [
  { name: '서울', lat: 37.5665, lon: 126.9780 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '제주', lat: 33.4996, lon: 126.5312 },
  { name: '경주', lat: 35.8562, lon: 129.2247 },
  { name: '강릉', lat: 37.7519, lon: 128.8761 },
  { name: '전주', lat: 35.8242, lon: 127.1470 },
  { name: '여수', lat: 34.7604, lon: 127.6622 },
  { name: '속초', lat: 38.2044, lon: 128.5912 },
];

const WeatherPage = () => {
  const [weatherList, setWeatherList] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // ✅ 도시별 현재 날씨 + 주간 예보 가져오기
  useEffect(() => {
    const fetchAllWeather = async () => {
      try {
        const requests = cities.map(async (city) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;
          const res = await fetch(url);
          const data = await res.json();
          return {
            name: city.name,
            ...data.current_weather,
            forecast: data.daily
          };
        });

        const results = await Promise.all(requests);
        setWeatherList(results);
      } catch (err) {
        console.error('날씨 오류:', err);
      }
    };

    fetchAllWeather();
  }, []);

  // ✅ 사용자 위치 탐지
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FSeoul`);
        const data = await res.json();
        setUserLocation({
          name: '내 위치',
          ...data.current_weather
        });
      });
    }
  }, []);

  return (
    <div>
      <Navbar />
      <div className="weather-container">
        <h2>🌤 전국 날씨 요약</h2>

        {userLocation && (
          <div className="weather-card user-location">
            <h3>📍 {userLocation.name}</h3>
            <p>🌡️ 기온: {userLocation.temperature}°C</p>
            <p>💨 풍속: {userLocation.windspeed} m/s</p>
            <p>🧭 풍향: {userLocation.winddirection}°</p>
            <p>🕓 시간: {userLocation.time.replace('T', ' ')}</p>
          </div>
        )}

        <div className="weather-grid">
          {weatherList.map((weather, index) => (
            <div className="weather-card" key={index}>
              <h3>📍 {weather.name}</h3>
              <p>🌡️ 기온: {weather.temperature}°C</p>
              <p>💨 풍속: {weather.windspeed} m/s</p>
              <p>🧭 풍향: {weather.winddirection}°</p>
              <p>🕓 시간: {weather.time.replace('T', ' ')}</p>
              {weather.forecast && (
                <div className="forecast">
                  <p>📅 내일 예보</p>
                  <p>최고: {weather.forecast.temperature_2m_max[1]}°C / 최저: {weather.forecast.temperature_2m_min[1]}°C</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
