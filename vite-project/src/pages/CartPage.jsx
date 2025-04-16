import React, { useEffect, useState , useRef } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';
import '../assets/css/Infowindow.css'
import { getPlaces } from '../assets/components/Databaseapi.jsx';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  const mapRef = useRef(null); // 🆕 지도 인스턴스 저장용
  const infoWindowRef = useRef(null); // 🆕 InfoWindow 인스턴스 저장용
  const markersRef = useRef([]); // 🆕 생성된 마커들을 저장

  //info생성함수
  const showInfoWindow = (map, marker, place) => {
    const content = `
      <div class="info-window">
        <h4>${place.name}</h4>
        <p>위도: ${place.lat.toFixed(6)}</p>
        <p>경도: ${place.lng.toFixed(6)}</p>
        <button class="info-add-btn">장바구니에 담기</button>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(map, marker);
  };



  //마커 생성 함수
  const createMarker = (place) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const position = new window.naver.maps.LatLng(place.lat, place.lng);
    const marker = new window.naver.maps.Marker({
      position,
      map,
      title: place.name,
    });

    // 마커 클릭 시 InfoWindow 표시
    window.naver.maps.Event.addListener(marker, 'click', () => {
      showInfoWindow(map, marker, place);
    });

    markersRef.current.push(marker);
    map.setCenter(position); // 지도 이동
  };

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



  //네이버지도 초기화
  useEffect(() => {
    const initMap = async () => {
      if (window.naver && tripInfo) {
        const { lat, lng } = tripInfo.region;
        const map = new window.naver.maps.Map('naver-map', {
          center: new window.naver.maps.LatLng(lat, lng),
          zoom: 13,
        });
        mapRef.current = map;
  
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map,
          title: tripInfo.region.name,
        });
  
        infoWindowRef.current = new window.naver.maps.InfoWindow({
          content: '',
          maxWidth: 300,
        });
  
        const data = await getPlaces('');        // ✅ 모든 장소 불러오기
        console.log("📦 전체 장소 응답:", data);
        renderMarkersFromPlaces(data);           // ✅ 지도에 마커 표시
      }
    };
  
    initMap();
  }, [tripInfo]);
  
  //마커 생성 함수
  const renderMarkersFromPlaces = (places) => {
    if (!mapRef.current) return;
  
    const map = mapRef.current;
    const regionName = tripInfo.region.name;
    
    // ✅ 해당 지역 이름이 포함된 장소만 필터링
    const filteredPlaces = places.filter((place) =>
      place.road_address?.toLowerCase().includes(regionName.toLowerCase())
    );

console.log(`📍 ${regionName} 지역 장소 개수:`, filteredPlaces.length);

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  
    filteredPlaces.forEach((place, index) => {
      const lat = place.lat || place.latitude;
      const lng = place.lng || place.longitude;
      const name = place.name || place.place_name;

      const position = new window.naver.maps.LatLng(lat, lng);
      const marker = new window.naver.maps.Marker({
        position,
        map,
        title: name,
      });
  
      window.naver.maps.Event.addListener(marker, 'click', () => {
        const content = `
          <div class="info-window">
            <h4>${place.name}</h4>
            <p>위도: ${place.lat.toFixed(6)}</p>
            <p>경도: ${place.lng.toFixed(6)}</p>
            <p>${place.description || '설명이 없습니다.'}</p>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      });
  
      markersRef.current.push(marker);
    });
    console.log("📌 마커 생성 시작:", places.length, "개");
    console.log("📍 첫 마커 좌표:", places[0]?.latitude, places[0]?.longitude);
  };
  


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
                      createMarker(item); // 🆕 마커 생성 호출
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

