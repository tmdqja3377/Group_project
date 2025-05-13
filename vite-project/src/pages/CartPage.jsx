import React, { useEffect, useState , useRef } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';
import "../assets/css/DetailPanel.css";
import { getPlaces, addPlannerItem, deletePlannerItem } from '../assets/components/Databaseapi.jsx';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [tripInfo, setTripInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const mapRef = useRef(null); // 🆕 지도 인스턴스 저장용
  const markersRef = useRef([]); // 🆕 생성된 마커들을 저장
  const navigate = useNavigate();

  // 장바구니에서 삭제
  const handleDeleteCartItem = async (index) => {
    const itemToDelete = cartItems[index];
    try {
      // 데이터베이스에서 항목 삭제
      await deletePlannerItem(itemToDelete.id); // 항목의 id를 기반으로 삭제

      // 장바구니에서 항목 삭제
      setCartItems(prev => prev.filter((_, i) => i !== index));
      console.log(`플래너 항목 ${itemToDelete.name}이 삭제되었습니다!`);
    } catch (error) {
      console.error("플래너 항목 삭제 실패", error);
    }
  };

  // 방문 날짜와 순서를 추가하여 플래너 아이템 데이터 구조화
  const handleAddToPlanner = async (place) => {
    try {
      const userId = localStorage.getItem('loggedInUserId'); // 로그인된 사용자의 ID 가져오기
      const visitDate = '2024-07-01';  // 예시: 방문 날짜
      const sequence = 1;  // 예시: 순서 (각각의 관광지가 장바구니에 담긴 순서)

      const plannerItemData = {
        userId,
        plannerId: tripInfo.plannerId, // 플래너 ID (예시: tripInfo에서 가져오기)
        spotId: place.id, // 관광지 ID
        visitDate, // 방문 날짜
        sequence, // 방문 순서
        latitude: place.latitude, // 위도
        longitude: place.longitude, // 경도
        spotName: place.name, // 장소 이름
      };

      console.log("전송되는 데이터:", plannerItemData); // 로그 추가: 전송될 데이터 확인

      // 백엔드 API 호출하여 플래너 아이템 저장
      await addPlannerItem(plannerItemData);
      console.log("플래너 항목이 저장되었습니다!");

      addToCart(place);

    } catch (error) {
      console.error("플래너 항목 저장 실패", error);
    }
  };


  const setMapCenter = (lat, lng) => {
    if (mapRef.current) {
      const newCenter = new window.naver.maps.LatLng(lat, lng);
      mapRef.current.setCenter(newCenter);
      mapRef.current.setZoom(16);
    }
  };

  const handleSuggestionClick = (place) => {
    setSearchTerm(place.name);
    setSuggestions([]);
    setSelectedPlace(place);
    setShowDetailPanel(true);
    setMapCenter(place.latitude, place.longitude);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  //상세페이지 애니메이션 지우기
  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setTimeout(() => setSelectedPlace(null), 300);
  };

  // 전역 addToCartItem 함수 등록
  useEffect(() => {
    window.addToCartItem = (encodedPlace) => {
      const place = JSON.parse(decodeURIComponent(encodedPlace));
      addToCart(place);
    };
  }, []);

  // 장바구니에 추가
  const addToCart = (place) => {
    setCartItems(prev => {
      if (prev.some(item => item.name === place.name)) return prev;
      return [...prev, place];
    });
  };

  // 장바구니에서 삭제
  const DeleteCartItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
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
      if (!tripInfo) return; // tripInfo 없으면 리턴

      const { lat, lng } = tripInfo.region;

      const createMap = () => { // ✅ 지도 생성 로직 분리
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
      };

      if (window.naver && window.naver.maps) {
        createMap();
        const data = await getPlaces('');
        renderMarkersFromPlaces(data);
      } else {
        const interval = setInterval(async () => { // ✅ naver.maps가 뜰 때까지 대기
          if (window.naver && window.naver.maps) {
            clearInterval(interval);
            createMap();
            const data = await getPlaces('');
            renderMarkersFromPlaces(data);
          }
        }, 100);
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
        setSelectedPlace(place);
        setShowDetailPanel(true);
      });

      markersRef.current.push(marker);
    });
  };
  


  return (
    <>
      <Navbar />
      <div className="cart-container">
        {/* Left Sidebar: 여행 정보 */}
        <div className="left-sidebar">
            {/* 🔍 검색창 */}
            <form className="search-bar-wrapper" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="장소를 검색하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-button"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
            <button type="submit" className="search-button">검색</button>
          </form>

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
            <div id="naver-map" className="map-box"></div>
            
            {/* 상세 패널 */}
            {selectedPlace && (
              <div className={`detail-panel ${showDetailPanel ? "open" : ""}`}>
                <button className="close-btn" onClick={closeDetailPanel}>×</button>
                <h2>{selectedPlace.name}</h2>
                <p><strong>📍 주소:</strong> {selectedPlace.road_address || "정보 없음"}</p>
                <p><strong>📞 연락처:</strong> {selectedPlace.phone || "없음"}</p>
                <p><strong>📝 소개:</strong> {selectedPlace.intro || "설명 없음"}</p>

                <button
                  onClick={() => handleAddToPlanner(selectedPlace)}
                  className="add-to-cart-button"
                >
                  장바구니에 담기
                </button>
              </div>
            )}
        </div>
        
        {/* Right Sidebar: 장바구니 */}
        <div className="right-sidebar">
        <h3>내 일정</h3>
          {cartItems.length === 0 ? (
            <p>장바구니에 담긴 장소가 없습니다.</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  {/* 이미지 */}
                  <div className="cart-item-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="placeholder-image" />
                    )}
                  </div>
                    
                  {/* 이름과 삭제 버튼 */}
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteCartItem(index)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="next-button" onClick={() => navigate('/schedule-summary')}>
            다음
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;

