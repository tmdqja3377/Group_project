import React, { useState } from 'react';
import Navbar from '../assets/components/Navbar.jsx';
import CalendarComponent from '../assets/components/Datecalendar.jsx';
import '../assets/css/LocationListPage.css';

function LocationListPage() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [travelers, setTravelers] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const regions = [
    { name: '서울', lat: 37.5665, lng: 126.9780 },
    { name: '부산', lat: 35.1796, lng: 129.0756 },
    { name: '제주', lat: 33.4996, lng: 126.5312 },
    { name: '경주', lat: 35.8562, lng: 129.2247 },
    { name: '강릉', lat: 37.7519, lng: 128.8761 },
    { name: '전주', lat: 35.8242, lng: 127.1479 },
    { name: '여수', lat: 34.7604, lng: 127.6622 },
    { name: '속초', lat: 38.2048, lng: 128.5912 },
  ];

  const handleSubmit = () => {
    if (!selectedRegion || !startDate || !endDate || !travelers) {
      alert('지역, 날짜, 인원 수를 모두 선택해 주세요.');
      return;
    }
    const tripData = { region: selectedRegion, startDate, endDate, travelers };
    localStorage.setItem('plannedTrip', JSON.stringify(tripData));
    window.location.href = '/Cart';
  };

  return (
    <>
      <Navbar />
      <div className="location-list-container">
        <h1 className="location-title">여행 일정 선택</h1>

        <div className="search-bar-ui">
          <button className="pill-button" onClick={() => setOpenDropdown(openDropdown === 'region' ? null : 'region')}>
            {selectedRegion?.name || '지역 선택'}
          </button>
          <button className="pill-button" onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}>
            {startDate ? `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}` : '날짜 선택'}
          </button>
          {/*이거랑 밑에 버튼이랑 고민해서 수정해야할듯*/} 
          <select
            className="filter-select"
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}명</option>
            ))}
          </select>
          {/* <button className="pill-button" onClick={() => setOpenDropdown(openDropdown === 'guest' ? null : 'guest')}>
            {travelers ? `${travelers}명` : '인원 선택'}
          </button> */}
        </div>

        {/* 아래 드롭다운 영역 */}
        {openDropdown === 'region' && (
          <div className="dropdown-panel">
            <h3>지역 선택</h3>
            <ul className="region-text-list">
              {regions.map(region => (
                <li
                  key={region.name}
                  className={`region-item ${selectedRegion?.name === region.name ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRegion(region);
                    setOpenDropdown(null);
                  }}
                >
                  {region.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {openDropdown === 'date' && (
          <div className="dropdown-panel">
            <h4>날짜 선택</h4>
            <CalendarComponent
              startDate={startDate}
              endDate={endDate}
              onRangeChange={({ selection }) => {
                setStartDate(selection.startDate);
                setEndDate(selection.endDate);
              }}
            />
          </div>
        )}

        {/* 이것도 추후 고민 */}
        
        {/* {openDropdown === 'guest' && (
          <div className="dropdown-panel">
            <h3>인원 수 선택</h3>
            <ul className="region-text-list">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <li
                  key={num}
                  className={`region-item ${travelers === num ? 'selected' : ''}`}
                  onClick={() => {
                    setTravelers(num);
                    setOpenDropdown(null);
                  }}
                >
                  {num}명
                </li>
              ))}
            </ul>
          </div>
        )} */}

        <button className="create-trip-button" onClick={handleSubmit}>
          선택한 조건으로 일정 만들기 →
        </button>
      </div>
    </>
  );
}

export default LocationListPage;