import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';
import { getPlaces } from '../assets/components/Databaseapi.jsx';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);
  const [places, setPlaces] = useState([]);
  const selectedPlace = places.find(place => String(place.id) === "3");  // 데이터베이스에서 id 3번 정보를 가져옴

  //여행정보 불러오기
  useEffect(() => {
    const storedTrip = localStorage.getItem('plannedTrip');
    if (storedTrip) {
      setTripInfo(JSON.parse(storedTrip));
    }
  }, []);

  //데이터베이스 api 불러오기
  useEffect(() => {
    if (tripInfo) {
      getPlaces()
        .then(data => setPlaces(data))
        .catch(err => console.error('데이터 불러오기 실패:', err));
    }
  }, [tripInfo]);


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
        
        {/* 임시 예제 id = 3번 데이터 불러와서 보여줌 */}
        <div className="right-sidebar">
          {selectedPlace ? (
            <>
              <h3>{selectedPlace.name}</h3>
              <p><strong>주소:</strong> {selectedPlace.road_address}</p>
              <p><strong>전화:</strong> {selectedPlace.phone}</p>
              <p><strong>소개:</strong> {selectedPlace.intro}</p>
            </>
          ) : (
            <p>관광지 정보를 찾을 수 없습니다.</p>
          )}
        </div>
        
        {/* Right Sidebar: 장바구니 */}
        {/* <div className="right-sidebar">
            <h3>내 일정</h3> */}
            {/* 여기에 장바구니 UI 추가 가능 */}
            {/* <p>장바구니에 담긴 장소들이 여기에 표시됩니다.</p>
        </div> */}
      </div>
    </>
  );
};

export default CartPage;

