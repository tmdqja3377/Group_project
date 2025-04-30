import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../assets/components/Navbar.jsx';
import CalendarComponent from '../assets/components/Datecalendar.jsx';
import '../assets/css/LocationListPage.css';

function LocationListPage() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [travelers, setTravelers] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const searchBarRef = useRef(null);

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

  // 외부 클릭 감지 로직 임시 주석 처리
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown((prev) => {
      const nextState = prev === dropdownName ? null : dropdownName;
      return nextState;
    });
  };  

  return (
    <>
      <Navbar />
        <div className="location-list-container">
          {/* 통합 검색 바 UI */}
          <div className="trip-search-bar" ref={searchBarRef}>
            <div className="search-item region-select">
              <button className="search-button" onClick={() => handleDropdownToggle('region')}>
                <span>지역</span>
                <span className="selected-value">{selectedRegion?.name || '어디로 갈까?'}</span>
              </button>
              {openDropdown === 'region' && (
                <div className="dropdown-panel region-dropdown">
                  {console.log('Rendering region dropdown')}
                  <ul className="region-text-list">
                    {regions.map((region) => (
                      <li
                        key={region.name}
                        className={`region-item ${
                          selectedRegion?.name === region.name ? 'selected' : ''
                        }`}
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
            </div>

            <div className="search-item date-select">
              <button className="search-button" onClick={() => handleDropdownToggle('date')}>
                <span>날짜</span>
                <span className="selected-value">
                  {startDate
                    ? `${startDate.toLocaleDateString('ko-KR')} - ${endDate.toLocaleDateString(
                        'ko-KR'
                      )}`
                    : '언제 갈까?'}
                </span>
              </button>
              {openDropdown === 'date' && (
                <div className="dropdown-panel date-dropdown">
                  {console.log('Rendering date dropdown')}
                  <CalendarComponent
                    startDate={startDate}
                    endDate={endDate}
                    onRangeChange={({ selection }) => {
                      setStartDate(selection.startDate);
                      setEndDate(selection.endDate);
                    }}
                  />
                  <button className="date-confirm-button" onClick={() => setOpenDropdown(null)}>
                      확인
                  </button>
                </div>
              )}
            </div>

            <div className="search-item guest-select">
              <button className="search-button" onClick={() => handleDropdownToggle('guest')}>
                <span>인원</span>
                <span className="selected-value">{travelers ? `${travelers}명` : '누구랑 갈까?'}</span>
              </button>
              {openDropdown === 'guest' && (
                <div className="dropdown-panel guest-dropdown scrollable-guest-dropdown">
                  <ul className="region-text-list">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
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
              )}
            </div>


            {/* 만들기 버튼 */}
            <button className="create-trip-button" onClick={handleSubmit}>
              검색
            </button>
          </div>
          {/* 기존 드롭다운 영역은 각 버튼 아래로 이동됨 */}
        </div>
    </>
  );
}

export default LocationListPage;