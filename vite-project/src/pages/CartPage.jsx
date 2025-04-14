import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const storedTrip = localStorage.getItem('plannedTrip');
    if (storedTrip) {
      setTripInfo(JSON.parse(storedTrip));
    }
  }, []);

  useEffect(() => {
    if (window.naver && tripInfo) {
      const { lat, lng } = tripInfo.region;
      const mapOptions = {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom: 13,
      };
      const map = new window.naver.maps.Map('naver-map', mapOptions);
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map,
        title: tripInfo.region.name,
      });
    }
  }, [tripInfo]);

  // 자동완성 API 호출
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/autocomplete?q=${searchTerm}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error('자동완성 API 오류:', error);
        setSuggestions([]);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <>
      <Navbar />
      <div className="cart-container">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          {/* 🔍 검색창 */}
          <div className="search-inline-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input-full"
              placeholder="장소를 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 자동완성 결과 */}
          {suggestions.length > 0 && (
            <ul className="autocomplete-list">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSearchTerm(item);
                    setSuggestions([]);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* 여행 정보 */}
          <h2>여행 정보</h2>
          {tripInfo ? (
            <ul>
              <li><strong>지역:</strong> {tripInfo.region.name}</li>
              <li><strong>날짜:</strong> {new Date(tripInfo.startDate).toLocaleDateString()} ~ {new Date(tripInfo.endDate).toLocaleDateString()}</li>
              <li><strong>인원수:</strong> {tripInfo.travelers}명</li>
            </ul>
          ) : (
            <p>여행 정보를 불러오는 중...</p>
          )}
        </div>

        {/* Map Section */}
        <div className="map-section">
          <div className="map-filters">
            <button>음식점</button>
            <button>명소</button>
            <button>카페</button>
          </div>
          <div id="naver-map" className="map-box"></div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <h3>내 일정</h3>
          <p>장바구니에 담긴 장소들이 여기에 표시됩니다.</p>
        </div>
      </div>
    </>
  );
};

export default CartPage;
