import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';
import { getPlaces } from '../assets/components/Databaseapi.jsx';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  //여행정보 불러오기
  useEffect(() => {
    const storedTrip = localStorage.getItem('plannedTrip');
    if (storedTrip) {
      setTripInfo(JSON.parse(storedTrip));
    }
  }, []);

  //데이터베이스 api 불러오기
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }
      const data = await getPlaces(searchTerm);
      console.log('✅ 자동완성 응답:', data);
      setSuggestions(data);
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);




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
        {/* Left Sidebar: 여행 정보 */}
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
                      setSearchTerm(item.name);
                      setSuggestions([]);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}

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

        

        {/* Map section: 네이버 지도 + 필터 버튼 (가운데) */}
        <div className="map-section">
          <div className="map-filters">
            <button>음식점</button>
            <button>명소</button>
            <button>카페</button>
            </div>
            <div id="naver-map" className="map-box">
            {/* 지도 삽입 위치 */}
          </div>
        </div>
        
        {/* Right Sidebar: 장바구니 */}
        <div className="right-sidebar">
            <h3>내 일정</h3>
            {/* 여기에 장바구니 UI 추가 가능 */}
            <p>장바구니에 담긴 장소들이 여기에 표시됩니다.</p>
        </div>
      </div>
    </>
  );
};

export default CartPage;

