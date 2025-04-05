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
            </div>
        </>
    );
}

export default LocationListPage;