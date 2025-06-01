import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../assets/components/Navbar.jsx';
import CalendarComponent from '../assets/components/Datecalendar.jsx';
import { createPlanner } from '../assets/components/Databaseapi.jsx';
import '../assets/css/LocationListPage.css';
import axios from 'axios';


function LocationListPage() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [travelers, setTravelers] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const searchBarRef = useRef(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendFoods, setRecommendFoods] = useState([]);
  const [recommendHotels, setRecommendHotels] = useState([]);
  const [randomRegion, setRandomRegion] = useState('');
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

  const handleSubmit = async () => {
    if (!selectedRegion || !startDate || !endDate || !travelers) {
      alert('지역, 날짜, 인원 수를 모두 선택해 주세요.');
      return;
    }

    

    const loggedInUserId = localStorage.getItem('loggedInUserId');
    console.log('🧪 로그인된 사용자 ID:', loggedInUserId);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tripData = {
      region: selectedRegion,
      startDate,
      endDate,
      travelers,
    };

    if (loggedInUserId) {
      const plannerPayload = {
        user_id: loggedInUserId,
        title: `${selectedRegion.name} 여행`,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        travelers,
        region_name: selectedRegion.name,
        lat: selectedRegion.lat,
        lng: selectedRegion.lng,
      };

      try {
        const result = await createPlanner(plannerPayload);

        tripData.plannerId = result.planner_id;
        
      } catch (err) {
        console.error('플래너 생성 실패:', err);
        alert('여행 계획 저장 중 오류가 발생했습니다.');
        return;
      }
    } else {
      console.log('🔓 비로그인 사용자: localStorage에만 저장');
    }

    localStorage.setItem('plannedTrip', JSON.stringify(tripData));
    window.location.href = '/Cart';
  };

  useEffect(() => {
    const allRegions = ['서울', '부산', '제주', '경주', '강릉', '전주', '여수', '속초'];
    const fetchPhotoInfoForCategory = async (items, region) => {
      const results = await Promise.all(items.map(async (item) => {
        try {
          const searchRes = await fetch(
            `http://localhost:5001/api/google/search-places?query=${region}+${item.장소명}`
          );
          const searchData = await searchRes.json();
          const found = searchData.results?.find(result => result.photos?.length > 0);

          const photoUrls = found?.photos?.map(photo =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
          ) || [];
          return { ...item, photoUrls };
        } catch (e) {
          console.error('사진 불러오기 실패:', e);
          return { ...item, photoUrls: [] };
        }
      }));

      return results;
    };
    
    const fetchRandomRecommendation = async () => {
      const allRegions = ['서울', '부산', '제주', '경주', '강릉', '전주', '여수', '속초'];
      const randomRegion = allRegions[Math.floor(Math.random() * allRegions.length)];
      setRandomRegion(randomRegion);
      console.log(`🎲 랜덤 지역 선택: ${randomRegion}`);

      try {
        const response = await fetch(
          `http://localhost:5001/api/google/search-places?query=여행+${randomRegion}+명소`
        );
        const data = await response.json();

        const places = data.results.slice(0, 20);

        const placeList = places.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
        const prompt = `
    다음은 ${randomRegion} 지역의 관광지 후보입니다:
    ${placeList}
    
    아래 형식처럼 관광지 5곳, 맛집 5곳, 숙소 5곳을 각각 JSON 배열로 추천해 주세요:
    
    {
      "추천장소": [
        { "장소명": "경복궁", "추천이유": "한국 전통을 느낄 수 있는 고궁입니다." }
      ],
      "추천맛집": [
        { "장소명": "명동교자", "추천이유": "서울 대표 칼국수 맛집입니다." }
      ],
      "추천숙소": [
        { "장소명": "롯데호텔", "추천이유": "럭셔리하고 교통이 편리한 숙소입니다." }
      ]
    }
    `;

        const chatRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_CHAT_GPT_API_KEY}`,
            },
          }
        );

        const content = chatRes.data.choices[0].message.content;
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        const getPhotos = async (categoryList) => {
          const res = await fetch('http://localhost:5001/api/google/batch-places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              region: randomRegion,
              place_names: categoryList.map(item => item.장소명),
            }),
          });

          const data = await res.json();
          const resultArray = data.results || [];

          if (!Array.isArray(resultArray)) {
            console.error('❌ 잘못된 응답 (expected array):', data);
            return categoryList.map(item => ({ ...item, photoUrls: [] }));
          }

          return categoryList.map(item => {
            const match = resultArray.find(d => d.장소명 === item.장소명);
            console.log('📸 매칭 결과:', item.장소명, match);
            return { ...item, photoUrls: match?.photoUrls || [] };
          });
        };
        

        const matchedSpots = await getPhotos(parsed.추천장소 || []);
        const foodsWithPhotos = await getPhotos(parsed.추천맛집 || []);
        const hotelsWithPhotos = await getPhotos(parsed.추천숙소 || []);

        setRecommendations(matchedSpots);
        setRecommendFoods(foodsWithPhotos);
        setRecommendHotels(hotelsWithPhotos);
      } catch (error) {
        console.error('🔥 랜덤 추천 실패:', error);
      }
    };
    
    

    fetchRandomRecommendation();
  }, []);

  useEffect(() => {
    const region = '서울';  // 또는 selectedRegion?.name 사용 가능
    fetch(`http://localhost:5001/api/preloaded-recommendations/${region}`)
      .then(res => res.json())
      .then(data => {
        // 명소
        const spots = (data['명소'] || []).map(item => ({
          장소명: item.name,
          추천이유: item.formatted_address || '방문하기 좋은 명소입니다.',
          photoUrls: item.photos?.length
            ? [`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`]
            : []
        }));
        setRecommendations(spots);

        // 맛집
        const foods = (data['맛집'] || []).map(item => ({
          장소명: item.name,
          추천이유: item.formatted_address || '현지인 추천 맛집입니다.',
          photoUrls: item.photos?.length
            ? [`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`]
            : []
        }));
        setRecommendFoods(foods);

        // 숙소
        const hotels = (data['숙소'] || []).map(item => ({
          장소명: item.name,
          추천이유: item.formatted_address || '숙박하기 좋은 장소입니다.',
          photoUrls: item.photos?.length
            ? [`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`]
            : []
        }));
        setRecommendHotels(hotels);
      })
      .catch(err => {
        console.error('🔥 추천 데이터 불러오기 실패:', err);
      });
  }, []);
  
  
  

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
          <div className='search-bottom-area'>
            <div className="ai-recommendations">
              <h3>추천 장소 ✨</h3>
              <div className="recommendation-list">
                {recommendations.map((item, index) => (
                  <div className="recommendation-card" key={index}>
                    <h4>{item.장소명}</h4>
                    <p>{item.추천이유}</p>
                    <div className="photo-gallery">
                      {item.photoUrls?.map((url, i) => (
                        <img key={i} src={url} alt={item.장소명} className="photo" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-recommendations">

              <h3>추천 맛집 🍽️</h3>
              <div className="recommendation-list">
                {recommendFoods.map((item, index) => (
                  <div className="recommendation-card" key={index}>
                    <h4>{item.장소명}</h4>
                    <p>{item.추천이유}</p>
                    <div className="photo-gallery">
                      {item.photoUrls?.map((url, i) => (
                        <img key={i} src={url} alt={item.장소명} className="photo" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>


            <div className="ai-recommendations">
              <h3>추천 숙소 🏨</h3>
              <div className="recommendation-list">
              {recommendHotels.map((item, index) => (
                <div className="recommendation-card" key={index}>
                  <h4>{item.장소명}</h4>
                  <p>{item.추천이유}</p>
                  <div className="photo-gallery">
                    {item.photoUrls?.map((url, i) => (
                      <img key={i} src={url} alt={item.장소명} className="photo" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
          {/* 기존 드롭다운 영역은 각 버튼 아래로 이동됨 */}
        </div>
    </>
  );
}

export default LocationListPage;