import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);

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
        {/* Left Sidebar: 여행 정보 */}
        <div className="left-sidebar">
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

