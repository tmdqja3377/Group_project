import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/ScheduleSummaryPage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updatePlannerItem } from '../assets/components/Databaseapi.jsx';

const API_URL = 'http://localhost:5001/api';
const API_KEY = '3plus3equal_random';
const userId = localStorage.getItem('loggedInUserId');

function getDateRangeList(startDate, endDate) {
  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    result.push(`${yyyy}-${mm}-${dd}`);
  }
  return result;
}

const ScheduleSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plannerId = location.state?.plannerId;

  const [tripInfo, setTripInfo] = useState(null); // 여행정보(planners)
  const [schedule, setSchedule] = useState({});   // 날짜별 일정
  const [cartItems, setCartItems] = useState([]); // 배치 전 장바구니
  const [newDate, setNewDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // AI로딩

  // 지도 관련
  const mapRef = useRef(null);
  const markerRef = useRef([]);

  // 날짜 클릭 시 지도 마커 보여줄 날짜 상태
  const [selectedDate, setSelectedDate] = useState(null);

  // 지도 로드
  useEffect(() => {
    if (window.google && !mapRef.current) {
      // 기본 center는 서울, tripInfo 있으면 해당 지역으로
      const center = tripInfo?.lat && tripInfo?.lng
        ? { lat: tripInfo.lat, lng: tripInfo.lng }
        : { lat: 37.5665, lng: 126.9780 };
      mapRef.current = new window.google.maps.Map(document.getElementById('google-map'), {
        center,
        zoom: 13,
      });
    }
  }, [tripInfo]);

  // 날짜 클릭 시 마커 표시
  useEffect(() => {
    // 지도 생성되어 있고, 날짜가 선택된 경우
    if (mapRef.current && selectedDate && schedule[selectedDate]) {
      // 기존 마커 제거
      markerRef.current.forEach(marker => marker.setMap(null));
      markerRef.current = [];

      // 해당 날짜 일정 마커 표시
      schedule[selectedDate].forEach(item => {
        if (!item.latitude || !item.longitude) return;
        const marker = new window.google.maps.Marker({
          position: { lat: Number(item.latitude), lng: Number(item.longitude) },
          map: mapRef.current,
          title: item.spotName || item.name,
        });
        markerRef.current.push(marker);
      });

      // 첫 번째 장소가 있으면 지도 center로 이동
      if (schedule[selectedDate].length > 0) {
        const first = schedule[selectedDate][0];
        if (first.latitude && first.longitude) {
          mapRef.current.setCenter({ lat: Number(first.latitude), lng: Number(first.longitude) });
          mapRef.current.setZoom(15);
        }
      }
    }
  }, [selectedDate, schedule]);

  // 최초 진입 시 DB에서 planner, planner_items 정보 조회
  useEffect(() => {
    if (!plannerId) return;

    // 1. 여행 정보 먼저 받아오기
    axios.get(`${API_URL}/planner/info`, {
      params: { plannerId },
      headers: { 'x-api-key': API_KEY }
    })
      .then(async res => {
        const info = res.data;
        setTripInfo(info);

        // 날짜 초기화
        const dateList = getDateRangeList(info.start_date, info.end_date);
        const initialSchedule = {};
        dateList.forEach(date => { initialSchedule[date] = []; });

        // 2. 그 다음 장소 정보 받아오기
        try {
          const res2 = await axios.get(`${API_URL}/planner/items`, {
            params: { plannerId },
            headers: { 'x-api-key': API_KEY }
          });

          const items = res2.data.items || [];
          const unassignedItems = [];

          items.forEach(item => {
            if (item.visit_date) {
              const formattedDate = new Date(item.visit_date).toISOString().split('T')[0];
              if (initialSchedule[formattedDate]) {
                initialSchedule[formattedDate].push(item);
              } else {
                unassignedItems.push(item);
              }
            } else {
              unassignedItems.push(item);
            }
          });

          // 정렬
          Object.keys(initialSchedule).forEach(date => {
            initialSchedule[date].sort((a, b) => a.sequence - b.sequence);
          });

          setSchedule(initialSchedule);
          setCartItems(unassignedItems);

          // 처음 진입 시 첫 날짜 자동 선택
          if (dateList.length > 0) setSelectedDate(dateList[0]);
        } catch (err) {
          alert('장소 정보 로드 실패');
        }
      })
      .catch(() => {
        alert('여행 정보 로드 실패');
      });
  }, [plannerId]);

  // ⭐️⭐️⭐️ GPT AI 자동분배 함수 (유일한 자동배치 기능)
  const handleAIAutoDistribute = async () => {
    if (!tripInfo) {
      alert('여행 정보가 없습니다.');
      return;
    }
    if (cartItems.length === 0) {
      alert('장바구니에 담긴 장소가 없습니다.');
      return;
    }
    setAiLoading(true);
    try {
      const dateList = getDateRangeList(tripInfo.start_date, tripInfo.end_date);

      const exampleDate = dateList[0];
      const spotNames = cartItems.map(i => i.spotName || i.name).join(', ');
      const prompt = `
아래 리스트에서만 골라서 ${tripInfo.region_name} ${dateList.length}일 여행 일정을 날짜별로 반드시 "각 날짜마다 2~5개의 서로 다른 장소"를 추천해줘.
하루에 같은 장소가 두 번 나오는 경우 절대 없어야 하고, 전체 일정에도 같은 장소가 두 번 이상 들어가면 안 돼.
각 날짜별로 places 배열에 2~5개 장소 이름만 주고, 결과는 반드시 [{"date":"${exampleDate}","places":["장소1","장소2","장소3"]}] 형식의 JSON 배열로만 반환해.
아래 리스트: [${spotNames}]
`

      // GPT-4o API 호출
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_CHAT_GPT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "너는 여행 일정을 자동으로 생성해주는 AI야." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });
      const data = await res.json();
      // JSON만 추출
      const content = data.choices?.[0]?.message?.content;
      // 혹시 GPT가 json block 안에 주면 match로 추출
      let jsonText = '';
      if (content.includes('```json')) {
        jsonText = content.split('```json')[1].split('```')[0];
      } else {
        jsonText = content.match(/\[.*\]/s)?.[0];
      }
      const aiSchedule = JSON.parse(jsonText);

      // 일정 state에 반영 (장소 객체 매칭)
      const newSchedule = {};
      dateList.forEach(d => newSchedule[d] = []);
      if (!aiSchedule || !Array.isArray(aiSchedule)) {
        alert("AI 응답이 올바르지 않습니다.\n" + JSON.stringify(aiSchedule));
        setAiLoading(false);
        return;
      }
      aiSchedule.forEach(day => {
        if (!day || !day.date || !Array.isArray(day.places)) return;
        // 날짜 문자열 클린(공백/숨은문자 제거)
        const cleanDate = String(day.date).replace(/[^\d-]/g, '').trim();
        let targetDate = dateList.find(dt =>
          dt === cleanDate ||
          dt.replace(/-/g, '') === cleanDate.replace(/-/g, '') ||
          dt.replace(/-/g, '') === cleanDate.replace(/\D/g, '')
        );
        if (!targetDate || !newSchedule[targetDate]) {
          console.warn('날짜 매칭 실패:', day.date, cleanDate, dateList);
          return;
        }
        day.places.forEach(placeName => {
          const found = cartItems.find(i =>
            (i.spotName || i.name) === placeName ||
            (i.spotName || i.name).includes(placeName) ||
            placeName.includes(i.spotName || i.name)
          );
          if (found) newSchedule[targetDate].push(found);
        });
      });
      setSchedule(newSchedule);
      setCartItems([]);
      alert("AI 일정 배치 완료!");
    } catch (err) {
      alert('AI 자동 분배 실패! (장소가 적거나 GPT 응답이 올바른지 확인)');
      console.error(err);
    }
    setAiLoading(false);
  };

  // 드래그 & 드롭 관련 로직
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // cart → 날짜로 이동
    if (source.droppableId === 'cart' && schedule[destination.droppableId]) {
      const newCart = Array.from(cartItems);
      const [movedItem] = newCart.splice(source.index, 1);
      const newSchedule = { ...schedule };
      newSchedule[destination.droppableId] = [
        ...newSchedule[destination.droppableId],
      ];
      newSchedule[destination.droppableId].splice(destination.index, 0, movedItem);
      setCartItems(newCart);
      setSchedule(newSchedule);
      return;
    }

    // 날짜 → 날짜
    if (schedule[source.droppableId] && schedule[destination.droppableId]) {
      const sourceItems = Array.from(schedule[source.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      const destItems = Array.from(schedule[destination.droppableId]);
      destItems.splice(destination.index, 0, movedItem);

      setSchedule({
        ...schedule,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
      return;
    }

    // 날짜 → cart
    if (schedule[source.droppableId] && destination.droppableId === 'cart') {
      const newSchedule = { ...schedule };
      const sourceItems = Array.from(schedule[source.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);

      setSchedule({
        ...schedule,
        [source.droppableId]: sourceItems,
      });
      setCartItems([...cartItems, movedItem]);
      return;
    }
  };

  // 날짜 추가
  const handleAddDate = () => {
    if (!newDate) return alert('날짜를 입력하세요.');
    if (schedule[newDate]) return alert('이미 존재하는 날짜입니다.');
    setSchedule({ ...schedule, [newDate]: [] });
    setNewDate('');
  };

  // 카트(장바구니)에서 제거
  const handleDeleteItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // 날짜별 일정에서 삭제(→ 다시 카트로 이동)
  const handleDeleteFromSchedule = (date, index) => {
    setCartItems(prev => [...prev, schedule[date][index]]);
    setSchedule(prev => ({
      ...prev,
      [date]: prev[date].filter((_, i) => i !== index),
    }));
  };

  // 저장(일정 최종 확정)
  const handleSave = async () => {
    if (Object.values(schedule).every(items => items.length === 0)) {
      alert('모든 날짜에 최소 1개 이상 장소를 배치해야 저장할 수 있습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = [];

      Object.entries(schedule).forEach(([date, items]) => {
        items.forEach((item, idx) => {
          if (item.id) {
            // ✅ 기존 항목이면 update
            savePromises.push(
              updatePlannerItem({
                id: item.id,
                visitDate: date,
                sequence: idx
              })
            );
          } else {
            // ✅ 새 항목이면 insert
            savePromises.push(
              axios.post(`${API_URL}/planner/add-item-simple`, {
                plannerId,
                latitude: item.latitude,
                longitude: item.longitude,
                spotName: item.spotName || item.name,
                visitDate: date,
                sequence: idx,
                photoReference: item.photoReference || null
              }, {
                headers: { 'x-api-key': API_KEY }
              })
            );
          }
        });
      });

      await Promise.all(savePromises);

      alert('저장 완료!');
      navigate('/mypage');
    } catch (err) {
      console.error('저장 실패:', err);
      alert('저장 실패!');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 렌더링 ---
  return (
    <>
      <Navbar />
      <div className="schedule-summary-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* 왼쪽: 날짜+장소+지도 묶음 */}
          <div className="left-main">
            <div className="schedule-info">
              <h2>📅 여행 계획 요약</h2>
              {tripInfo && (
                <div className="trip-info">
                  <p><strong>지역:</strong> {tripInfo.region_name}</p>
                  <p><strong>날짜:</strong> {tripInfo.start_date} ~ {tripInfo.end_date}</p>
                  <p><strong>인원수:</strong> {tripInfo.travelers}명</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {/* 날짜+장소 리스트(왼쪽) */}
              <div className="schedule-days">
                {Object.keys(schedule).map((date) => (
                  <Droppable droppableId={date} key={date}>
                    {(provided) => (
                      <div
                        className={`schedule-day${selectedDate === date ? ' selected' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        onClick={() => setSelectedDate(date)}
                      >
                        <h3 style={{ cursor: 'pointer', margin: 0 }}>
                          {date}
                        </h3>
                        {schedule[date].map((item, index) => (
                          <Draggable
                            key={`sch-${date}-${index}`}
                            draggableId={`sch-${date}-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="schedule-item"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                📍 {item.spotName || item.name}
                                <button
                                  className="delete-button"
                                  onClick={e => { e.stopPropagation(); handleDeleteFromSchedule(date, index); }}
                                >삭제</button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
              {/* 지도(오른쪽) */}
              <div className="map-area">
                  <div className="map-border-box"></div>
                <div
                  id="google-map"
                  className="google-map-schedule"
                ></div>
              </div>
            </div>
          </div>
          {/* 오른쪽: 장바구니 */}
          <div className="right-sidebar">
            <h3>내 일정</h3>
            <Droppable droppableId="cart">
              {(provided) => (
                <div className="cart-list" ref={provided.innerRef} {...provided.droppableProps}>
                  {cartItems.length === 0 ? (
                    <p>장바구니에 담긴 장소가 없습니다.</p>
                  ) : (
                    cartItems.map((item, index) => (
                      <Draggable
                        key={`cart-${index}`}
                        draggableId={`cart-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="cart-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="cart-item-info">
                              <strong>{item.spotName || item.name}</strong>
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteItem(index)}
                              >삭제</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* 🤖 AI 자동배치 (유일한 자동배치 기능) */}
            <button
              onClick={handleAIAutoDistribute}
              disabled={!tripInfo || cartItems.length === 0 || aiLoading}
              className="ai-generate-btn custom-purple"
            >
              {aiLoading
                ? "AI가 여행 일정 생성 중..."
                : (cartItems.length === 0
                  ? "장바구니가 비어있어요"
                  : "🤖 AI 자동 배치")}
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </DragDropContext>
      </div>
    </>
  );
};

export default ScheduleSummaryPage;
