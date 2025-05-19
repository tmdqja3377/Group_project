import React, { useEffect, useState , useRef } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/CartPage.css';
import "../assets/css/DetailPanel.css";
import { getPlaces, addPlannerItem, deletePlannerItem } from '../assets/components/Databaseapi.jsx';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [googlePlaceDetails, setGooglePlaceDetails] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);
  const [category, setCategory] = useState('restaurant');
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;


  const mapRef = useRef(null); // 🆕 지도 인스턴스 저장용
  const markersRef = useRef([]); // 🆕 생성된 마커들을 저장
  const navigate = useNavigate();

  //구글 API관련
  const fetchGooglePlaceDetails = async (placeName, setGooglePlaceDetails) => {
    try {
      const res = await fetch(`http://localhost:5001/api/google/proxy-place-details?place_name=${encodeURIComponent(placeName)}`);
      const data = await res.json();
      setGooglePlaceDetails(data);
    } catch (error) {
      console.error('구글 장소 정보 조회 실패:', error);
      setGooglePlaceDetails(null);
    }
  };

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setActiveTab('photos');
    setIsInfoPanelVisible(true);
    fetchGooglePlaceDetails(place.name, setGooglePlaceDetails);
  };

  const loadPlaces = (map, selectedCategory) => {
    const center = map.getCenter();
    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch({ location: center, radius: 5000, type: selectedCategory }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        results.forEach((place) => {
          const marker = new window.google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
          });
          marker.addListener('click', () => handleMarkerClick(place));
          markersRef.current.push(marker);
        });
      }
    });
  };

  useEffect(() => {
    if (!window.google) return;

    const storedTripData = localStorage.getItem('plannedTrip');
    const storedTrip = storedTripData ? JSON.parse(storedTripData) : null;

      const center = storedTrip?.region
      ? { lat: storedTrip.region.lat, lng: storedTrip.region.lng }
      : { lat: 37.5665, lng: 126.9780 }; // 기본값: 서울
      const map = new window.google.maps.Map(document.getElementById('google-map'), {
        center,
        zoom: 13,
      });
      mapRef.current = map;
      loadPlaces(map, category);
    }, []);

  useEffect(() => {
    if (mapRef.current) {
      loadPlaces(mapRef.current, category);
    }
  }, [category]);
  //여기까지 google API관련임

  //장바구니 추가 프론트 + 백앤드
  const handleAddToPlanner = async (place) => {
    if (!tripInfo || !tripInfo.plannerId) {
      alert('먼저 플래너를 생성해주세요!');
      return;
    }
    try {
      const userId = localStorage.getItem('loggedInUserId');
      const plannerItemData = {
        plannerId: tripInfo.plannerId,
        latitude: place.geometry?.location?.lat() ?? 0,
        longitude: place.geometry?.location?.lng() ?? 0,
        spotName: place.name,
      };
      console.log("plannerItemData 확인:", plannerItemData);
      await addPlannerItem(plannerItemData);  // 🔥 여기서 DB 저장 호출
      
      addToCart(place);  // 로컬 상태 업데이트
    } catch (error) {
      console.error('플래너 항목 저장 실패', error);
    }
  }; 

  // 장바구니에 추가
  const addToCart = (place) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.name === place.name)) {
        alert("이미 장바구니에 담은 장소입니다.");
        return prev;
      }
      const photoReference = googlePlaceDetails?.photos?.[0]?.photo_reference || null;
      return [...prev, { ...place, photoReference }];
    });
  };



  // 장바구니에서 삭제
  // const handleDeleteCartItem = async (index) => {
  //   const itemToDelete = cartItems[index];
  //   try {
  //     // 데이터베이스에서 항목 삭제
  //     await deletePlannerItem(itemToDelete.id); // 항목의 id를 기반으로 삭제

  //     // 장바구니에서 항목 삭제
  //     setCartItems(prev => prev.filter((_, i) => i !== index));
  //     console.log(`플래너 항목 ${itemToDelete.name}이 삭제되었습니다!`);
  //   } catch (error) {
  //     console.error("플래너 항목 삭제 실패", error);
  //   }
  // };

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

  // // 전역 addToCartItem 함수 등록
  // useEffect(() => {
  //   window.addToCartItem = (encodedPlace) => {
  //     const place = JSON.parse(decodeURIComponent(encodedPlace));
  //     addToCart(place);
  //   };
  // }, []);


  // 장바구니에서 삭제
  // const DeleteCartItem = (index) => {
  //   setCartItems(prev => prev.filter((_, i) => i !== index));
  // };  
  
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

        

        {/* Map section: 네이버 지도 + 필터 버튼 (가운데) -> 구글지도로 바꿈 */}
        <div className="map-section">
          <div className="map-filters">
            <button onClick={() => setCategory('restaurant')}>🍽 음식점</button>
            <button onClick={() => setCategory('tourist_attraction')}>📍 명소</button>
            <button onClick={() => setCategory('cafe')}>☕ 카페</button>
            <button onClick={() => setCategory('lodging')}>🏨 숙소</button>
            <button onClick={() => setCategory('all')}>🌐 전체</button>
          </div>
          <div id="google-map" className="map-box"></div>

          {selectedPlace && (
            <div className={`info-panel ${isInfoPanelVisible ? 'visible' : ''}`}>
              <div className="tab-buttons">
                <button onClick={() => setActiveTab('photos')} className={activeTab === 'photos' ? 'active' : ''}>📸 사진</button>
                <button onClick={() => setActiveTab('reviews')} className={activeTab === 'reviews' ? 'active' : ''}>💬 리뷰</button>
              </div>

              <button className="close-btn" onClick={() => setIsInfoPanelVisible(false)}>×</button>
              <h2>{selectedPlace.name}</h2>
              <p><strong>📍 주소:</strong> {selectedPlace.vicinity || '정보 없음'}</p>
              <p><strong>📞 연락처:</strong> {selectedPlace.formatted_phone_number || '없음'}</p>
              <p><strong>📝 소개:</strong> {selectedPlace.description || '설명 없음'}</p>

              {/* ✅ 장바구니 버튼은 패널 하단으로 이동 */}
              <div className="cart-action-buttons">
                {cartItems.some(item => item.name === selectedPlace.name) ? (
                  <button
                    className="remove-from-cart-button"
                    onClick={() => setCartItems(cartItems.filter(item => item.name !== selectedPlace.name))}
                  >
                    ➖ 장바구니에서 제거
                  </button>
                ) : (
                  <button
                    className="add-to-cart-button"
                    onClick={() => handleAddToPlanner(selectedPlace)}
                  >
                    ➕ 장바구니에 담기
                  </button>
                )}
              </div>

              {selectedPlace.types?.includes('lodging') && (
                <p>
                  <a
                    href={`https://www.yanolja.com/search?keyword=${encodeURIComponent(selectedPlace.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🏨 야놀자에서 예약하기
                  </a>
                </p>
              )}
              {/* 상세페이지 사진 */}
              {googlePlaceDetails && activeTab === 'photos' && (
                <div className="photos-section">
                  {googlePlaceDetails.photos?.slice(0, 6).map((photo, idx) => (
                    <img
                      key={idx}
                      className="info-photo"
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`}
                      alt="장소 사진"
                    />
                  ))}
                </div>
              )}
              {/* 리뷰사진 */}
              {googlePlaceDetails && activeTab === 'reviews' && (
                <div className="reviews-section">
                  {googlePlaceDetails.reviews?.slice(0, 5).map((review, idx) => (
                    <div key={idx} className="review-item">
                      <p>"{review.text}"</p>
                      <p><strong>작성자:</strong> {review.author_name || '익명'}</p>
                      <p><strong>⭐ 평점:</strong> {review.rating || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
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
              {cartItems.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <strong>{item.name}</strong>
                  {item.photoReference && (
                    <img
                      className="info-photo"
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photoReference}&key=${GOOGLE_API_KEY}`}
                      alt="대표 사진"
                    />
                  )}
                  <button className="delete-button" onClick={() => setCartItems(cartItems.filter((_, i) => i !== idx))}>삭제</button>
                </div>
              ))}
            </div>
          )}
          <button className="next-button" onClick={() => navigate('/schedule-summary', { state: { plannerId: tripInfo.plannerId } })
          }>  
            다음
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;