import React, { useEffect, useState } from 'react';
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
        result.push(d.toISOString().split('T')[0]);
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

    // [AI 자동생성 로딩 상태]
    const [isAiGenerating, setIsAiGenerating] = useState(false);

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

            } catch (err) {
                alert('장소 정보 로드 실패');
            }
        })
        .catch(() => {
            alert('여행 정보 로드 실패');
        });
    }, [plannerId]);

    // [핵심] AI + DB 기반 자동 일정 생성 함수
    const handleAIGenerate = async () => {
        if (!tripInfo) {
            alert('여행 정보가 없습니다.');
            return;
        }
        setIsAiGenerating(true);
        try {
            // 1. tourist_spots DB에서 후보장소 fetch (지역 기반)
            const spotRes = await axios.get(
                `${API_URL}/places`,
                {
                    params: { q: tripInfo.region_name },
                    headers: { 'x-api-key': API_KEY }
                }
            );
            const candidateSpots = spotRes.data; // [{ name, latitude, longitude, ... }]

            if (!candidateSpots || candidateSpots.length === 0) {
                alert('해당 지역에 추천 가능한 장소가 없습니다.');
                setIsAiGenerating(false);
                return;
            }

            // 2. 날짜 리스트 생성
            const dateList = getDateRangeList(tripInfo.start_date, tripInfo.end_date);

            // 3. 프롬프트 생성
            const spotNames = candidateSpots.map(s => s.name).join(', ');
            const prompt = `
아래 장소 리스트에서만 골라서 ${tripInfo.region_name} ${dateList.length}일 여행 일정을 날짜별로 짜줘.
아래 이름 외 장소는 추천하지 마. 하루 3~5곳, 아침/점심/저녁 순서대로 추천해.
장소 이름만 주고, 결과는 다음 형태의 JSON 배열로 줘. 
[{"date":"2024-06-01","places":["장소1","장소2"]}]
아래 리스트: [${spotNames}]
`;

            // 4. OpenAI API 호출 (환경변수에서 키 로드)
            const apiKey = import.meta.env.VITE_CHAT_GPT_API_KEY;
            const aiRes = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: "너는 똑똑한 여행 플래너야." },
                        { role: "user", content: prompt }
                    ]
                },
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            const aiText = aiRes.data.choices[0].message.content;

            // 5. AI 응답에서 JSON 배열 추출 및 파싱
            const aiPlan = JSON.parse(aiText.match(/\[.*\]/s)[0]);
            // 6. 날짜별 schedule 객체 생성 + DB 매칭 (lat/lng 등 포함)
            const newSchedule = {};
            aiPlan.forEach(day => {
                newSchedule[day.date] = (day.places || []).map(placeName => {
                    const dbSpot = candidateSpots.find(s => s.name === placeName);
                    return dbSpot
                        ? {
                            spotName: dbSpot.name,
                            latitude: dbSpot.latitude,
                            longitude: dbSpot.longitude,
                        }
                        : { spotName: placeName };
                });
            });
            setSchedule(newSchedule);
            setCartItems([]);
        } catch (err) {
            alert("AI 자동 일정 생성 실패!");
            console.error(err);
        }
        setIsAiGenerating(false);
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
                        // ✅ 기존 항목: 업데이트
                        savePromises.push(
                            updatePlannerItem({
                                id: item.id,
                                visitDate: date,
                                sequence: idx
                            })
                        );
                    } else {
                        // ✅ 새로 추가된 항목: 인서트
                        savePromises.push(
                            axios.post(`${API_URL}/planner/add-item-simple`, {
                                plannerId,
                                latitude: item.latitude,
                                longitude: item.longitude,
                                spotName: item.spotName || item.name,
                                visitDate: date,
                                sequence: idx
                            }, { headers: { 'x-api-key': API_KEY } })
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
                    <div className="schedule-days">
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
                        {/* 날짜별 Droppable 영역 */}
                        {Object.keys(schedule).map((date) => (
                            <Droppable droppableId={date} key={date}>
                                {(provided) => (
                                    <div className="schedule-day" ref={provided.innerRef} {...provided.droppableProps}>
                                        <h3>{date}</h3>
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
                                                            style={{ marginLeft: 8 }}
                                                            onClick={() => handleDeleteFromSchedule(date, index)}
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

                    {/* 오른쪽 장바구니 */}
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
                        {/* ⭐️ AI 자동생성 버튼 (저장 버튼 위로 이동!) ⭐️ */}
                        <button
                            onClick={handleAIGenerate}
                            disabled={isAiGenerating || !tripInfo}
                            className="ai-generate-btn"
                            style={{ marginTop: '16px', marginBottom: '10px' }}
                        >
                            {isAiGenerating ? "AI 생성 중..." : "🧠 AI로 일정 자동생성"}
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
