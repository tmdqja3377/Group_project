import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/LocationListPage.css';
import 'react-datepicker/dist/react-datepicker.css';
// import { regionData } from '../data/regionData';

function LocationListPage() {
    const navigate = useNavigate();
    
    // 기본 상태 관리
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 기본 3일 여행
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [travelers, setTravelers] = useState(2);
    const [transportation, setTransportation] = useState('대중교통');
    const [budget, setBudget] = useState('중간');
    const [interests, setInterests] = useState([]);
    const [savedTrips, setSavedTrips] = useState([]);
    const [showPlanningOptions, setShowPlanningOptions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 국내 관심사 선택지
    const interestOptions = [
        '식도락', '역사/문화', '자연경관', '액티비티', '쇼핑', '휴양', '축제/공연', '박물관/미술관'
    ];

    // 국내 지역 데이터
    const koreanRegions = [
        { name: '서울', slug: 'seoul', image: '/img/seoul/seoul.jpg', description: '대한민국의 수도, 현대와 전통이 공존하는 도시' },
        { name: '부산', slug: 'busan', image: '/img/busan/busan.jpg', description: '해변과 산이 어우러진 항구도시' },
        { name: '제주', slug: 'jeju', image: '/img/jeju/jeju.jpg', description: '아름다운 자연과 독특한 문화의 섬' },
        { name: '경주', slug: 'gyeongju', image: '/img/gyeongju/gyeongju.jpg', description: '한국의 고대 역사가 살아 숨쉬는 도시' },
        { name: '강릉', slug: 'gangneung', image: '/img/gangneung/gangneung.jpg', description: '동해의 아름다운 해변과 커피 문화의 도시' },
        { name: '전주', slug: 'jeonju', image: '/img/jeonju/jeonju.jpg', description: '한옥마을과 전통 문화의 중심지' },
        { name: '여수', slug: 'yeosu', image: '/img/yeosu/yeosu.jpg', description: '아름다운 밤바다와 해양 관광의 중심지' },
        { name: '속초', slug: 'sokcho', image: '/img/sokcho/sokcho.jpg', description: '설악산과 동해가 만나는 관광 도시' }
    ];

    // 이전에 계획한 여행 로드
    useEffect(() => {
        const saved = localStorage.getItem('savedTrips');
        if (saved) {
            setSavedTrips(JSON.parse(saved));
        }
    }, []);

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setShowPlanningOptions(true);
    };

    const handleInterestToggle = (interest) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(item => item !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    const handleCreateTrip = () => {
        if (!selectedRegion) {
            alert('여행 지역을 선택해주세요.');
            return;
        }

        const newTrip = {
            id: Date.now(),
            region: selectedRegion,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            travelers,
            transportation,
            budget,
            interests,
            spots: []
        };

        // 새 여행 저장
        const updatedTrips = [...savedTrips, newTrip];
        setSavedTrips(updatedTrips);
        localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));

        // 해당 지역 상세 페이지로 이동
        navigate(`/${selectedRegion.slug}`, { 
            state: { 
                tripId: newTrip.id,
                tripDates: { start: startDate, end: endDate }
            } 
        });
    };

    const handleContinueTrip = (trip) => {
        navigate(`/${trip.region.slug}`, { 
            state: { 
                tripId: trip.id,
                tripDates: { start: new Date(trip.startDate), end: new Date(trip.endDate) }
            } 
        });
    };

    const handleDeleteTrip = (tripId) => {
        const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
        setSavedTrips(updatedTrips);
        localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
    };

    const filteredRegions = koreanRegions.filter(
        region => region.name.includes(searchTerm) || region.description.includes(searchTerm)
    );

    // 여행 날짜 계산
    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <>
            <Navbar />
            <div className="location-list-container">
                <h1 className="location-title">국내 여행 계획하기</h1>
                
                {/* 검색 필터 */}
                <div className="search-filters">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="여행지 검색 (예: 서울, 해변, 역사...)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <button className="date-button" onClick={() => setShowDatePicker(!showDatePicker)}>
                        {startDate && endDate
                            ? `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`
                            : '날짜 선택'}
                    </button>

                    <select 
                        className="filter-select"
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num}명</option>
                        ))}
                    </select>
                </div>

                {/* 날짜 선택 */}
                {showDatePicker && (
                    <div className="date-picker-container">
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(dates) => {
                                const [start, end] = dates;
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            dateFormat="yyyy-MM-dd"
                            inline
                        />
                    </div>
                )}

                {/* 지역 목록 */}
                <div className="regions-grid">
                    {filteredRegions.map((region) => (
                        <div 
                            key={region.slug}
                            className={`region-card ${selectedRegion?.slug === region.slug ? 'selected' : ''}`}
                            onClick={() => handleRegionSelect(region)}
                        >
                            <div className="region-image" style={{ backgroundImage: `url(${region.image})` }}>
                                <h3 className="region-name">{region.name}</h3>
                            </div>
                            <p className="region-description">{region.description}</p>
                        </div>
                    ))}
                </div>

                {/* 여행 계획 옵션 */}
                {showPlanningOptions && selectedRegion && (
                    <div className="planning-options">
                        <h2>{selectedRegion.name} 여행 계획</h2>
                        
                        <div className="planning-form">
                            <div className="form-group">
                                <label>교통 수단</label>
                                <select 
                                    value={transportation} 
                                    onChange={(e) => setTransportation(e.target.value)}
                                >
                                    <option value="대중교통">대중교통</option>
                                    <option value="자가용">자가용</option>
                                    <option value="렌터카">렌터카</option>
                                    <option value="투어버스">투어버스</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>예산</label>
                                <select 
                                    value={budget} 
                                    onChange={(e) => setBudget(e.target.value)}
                                >
                                    <option value="저렴">저렴</option>
                                    <option value="중간">중간</option>
                                    <option value="고급">고급</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>관심사 (다중 선택 가능)</label>
                                <div className="interests-container">
                                    {interestOptions.map((interest) => (
                                        <button 
                                            key={interest}
                                            className={`interest-tag ${interests.includes(interest) ? 'selected' : ''}`}
                                            onClick={() => handleInterestToggle(interest)}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <button className="create-trip-button" onClick={handleCreateTrip}>
                            {selectedRegion.name} 여행 계획 시작하기
                        </button>
                    </div>
                )}

                {/* 저장된 여행 계획 */}
                {savedTrips.length > 0 && (
                    <div className="saved-trips">
                        <h2>저장된 여행 계획</h2>
                        <div className="trips-grid">
                            {savedTrips.map((trip) => (
                                <div key={trip.id} className="trip-card">
                                    <div className="trip-header">
                                        <h3>{trip.region.name} 여행</h3>
                                        <div className="trip-actions">
                                            <button 
                                                className="delete-button" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTrip(trip.id);
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                    <p className="trip-dates">
                                        {new Date(trip.startDate).toLocaleDateString()} ~ {new Date(trip.endDate).toLocaleDateString()}
                                        <span className="trip-days">({calculateDays(trip.startDate, trip.endDate)}일)</span>
                                    </p>
                                    <p className="trip-details">
                                        인원: {trip.travelers}명 · {trip.transportation} · 예산: {trip.budget}
                                    </p>
                                    {trip.interests.length > 0 && (
                                        <div className="trip-interests">
                                            {trip.interests.map(interest => (
                                                <span key={interest} className="trip-interest-tag">{interest}</span>
                                            ))}
                                        </div>
                                    )}
                                    <button 
                                        className="continue-button"
                                        onClick={() => handleContinueTrip(trip)}
                                    >
                                        계속 계획하기
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default LocationListPage;