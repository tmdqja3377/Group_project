// TouristSpotPage.jsx
import React, { useEffect, useState } from 'react';

const TouristSpotPage = () => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await fetch('http://localhost:3000/tourist-spots');
        const data = await res.json();
        console.log("📍 관광지 데이터:", data);
        setSpots(data);
      } catch (err) {
        console.error("❌ 관광지 데이터 불러오기 실패:", err);
      }
    };

    fetchSpots();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📍 관광지 목록</h2>
      {spots.length === 0 ? (
        <p>관광지 정보가 없습니다.</p>
      ) : (
        <ul>
          {spots.map((spot) => (
            <li key={spot.id}>
              <strong>{spot.name}</strong> - {spot.area} ({spot.category})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TouristSpotPage;
