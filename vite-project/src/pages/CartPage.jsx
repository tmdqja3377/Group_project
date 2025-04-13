import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResult, setShowSearchResult] = useState(false);

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

  return (
    <>
      <Navbar />
      <div className="cart-container">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          <h2>검색</h2>
          <input
            type="text"
            placeholder="장소 이름을 입력하세요"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="search-button"
            onClick={() => setShowSearchResult(!showSearchResult)}
          >
            검색
          </button>

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

          {/* 검색 결과 (토글 표시) */}
          {showSearchResult && (
            <div className="search-result">
              <p>🔍 "{searchTerm}" 검색 결과 표시 영역</p>
              {/* 여기에 실제 결과 리스트를 map으로 출력 가능 */}
            </div>
          )}
        </div>

        {/* Map + 장바구니 */}
        <div className="map-section">
          <div className="map-filters">
            <button>음식점</button>
            <button>명소</button>
            <button>카페</button>
          </div>
          <div id="naver-map" className="map-box"></div>
        </div>

        <div className="right-sidebar">
          <h3>내 일정</h3>
          <p>장바구니에 담긴 장소들이 여기에 표시됩니다.</p>
        </div>
      </div>
    </>
  );
};

export default CartPage;

