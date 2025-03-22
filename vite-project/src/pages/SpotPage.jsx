// src/pages/SpotPage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../public/css/Appv.css"

function SpotPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
    if (storedIsLoggedIn === 'true') {
      setIsLoggedIn(true);
      const loggedInUsername = Object.keys(storedUsers).find(
        (key) => storedUsers[key] === localStorage.getItem('loggedInPassword')
      );
      setUsername(loggedInUsername || '');
    } else {
      setIsLoggedIn(false);
      setUsername('');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInPassword');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
  };

  // 카테고리별 여행지 및 음식점 목록
  const [spots] = useState([
    { id: 1, name: "제주도", description: "아름다운 해변과 한라산", category: "관광지" },
    { id: 2, name: "서울", description: "대한민국의 수도", category: "관광지" },
    { id: 3, name: "부산", description: "해운대와 광안리 해변", category: "관광지" },
    { id: 4, name: "강릉", description: "경포대 해수욕장과 커피거리", category: "관광지" },
    { id: 5, name: "경주", description: "천년의 고도 신라의 수도", category: "관광지" },
    { id: 6, name: "전주 한옥마을", description: "전주 한옥마을과 맛있는 비빔밥", category: "음식점" },
    { id: 7, name: "광주 맛집", description: "5.18 민주화운동 기념관과 맛집", category: "음식점" },
    { id: 8, name: "대전", description: "엑스포과학공원과 한밭수목원", category: "관광지" },
    { id: 9, name: "울산", description: "태화강과 울산대공원", category: "관광지" },
    { id: 10, name: "인천", description: "차이나타운과 송도 센트럴파크", category: "관광지" },
    { id: 11, name: "속초", description: "설악산과 속초 해변", category: "관광지" },
    { id: 12, name: "서울 맛집", description: "서울에서 유명한 맛집", category: "음식점" },
    { id: 13, name: "부산 해산물", description: "부산의 유명한 해산물 음식점", category: "음식점" },
    { id: 14, name: "서울 호텔", description: "서울의 유명한 호텔", category: "호텔" },
    { id: 15, name: "강릉 호텔", description: "강릉의 유명한 호텔", category: "호텔" },
    { id: 16, name: "경주 호텔", description: "경주의 유명한 호텔", category: "호텔" },
    { id: 17, name: "서울 일자", description: "서울에서 할 수 있는 일자", category: "일자" },
    { id: 18, name: "부산 일자", description: "부산에서 할 수 있는 일자", category: "일자" },
  ]);

  // 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 검색어 상태 관리
  const [searchTerm, setSearchTerm] = useState("");

  // 필터링된 목록
  const filteredSpots = spots.filter(spot =>
    (selectedCategory === "전체" || spot.category === selectedCategory) &&
    spot.name.includes(searchTerm)
  );

  // 버튼 클릭 핸들러
  const handleButtonClick = (category) => {
    setSelectedCategory(category);
  };

  // 제목을 카테고리에 따라 동적으로 설정
  const getTitle = () => {
    if (selectedCategory === "전체") {
      return " 전체 목록";
    } else if (selectedCategory === "음식점") {
      return " 음식점 목록";
    } else if (selectedCategory === "호텔") {
      return " 호텔 목록";
    } else if (selectedCategory === "관광지") {
      return "️ 관광지 목록";
    } else if (selectedCategory === "일자") {
      return "️ 일자 목록";
    } else {
      return `${selectedCategory} 목록`;
    }
  };

  return (
    <>
      {/* 좌측 상단 검색 기능 및 버튼들 //숨겨져 있음 */}
      <div className="search-container">
        {/* 검색 입력창 */}
        <input
          type="text"
          placeholder="여행지를 검색하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {/* 버튼 리스트 */}
        <div className="button-group">
          {["전체", "음식점", "호텔", "관광지", "일자"].map((button) => (
            <button
              key={button}
              onClick={() => handleButtonClick(button)}
              className="category-button"
            >
              {button}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리별 목록 */}
      <div className="App">
        <h2 style={{ marginTop: '40px' }}>{getTitle()}</h2>
        <ul className="spot-list">
          {filteredSpots.length > 0 ? (
            filteredSpots.map((spot) => (
              <li key={spot.id} className="spot-item">
                <strong>{spot.name}</strong> - {spot.description}
              </li>
            ))
          ) : (
            <p>검색 결과가 없습니다.</p>
          )}
        </ul>
      </div>
    </>
  );
}

export default SpotPage;