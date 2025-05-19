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

    
    // 최초 진입 시 DB에서 planner, planner_items 정보 조회
    useEffect(() => {
        if (!plannerId) return;
        // 1. 여행정보 불러오기 (planners)
        axios.get(`${API_URL}/planner/info`, {
            params: { plannerId },
            headers: { 'x-api-key': API_KEY }
        })
        .then(res => {
            setTripInfo(res.data);
            // 날짜 배열로 schedule 초기화
            const dateList = getDateRangeList(res.data.start_date, res.data.end_date);
            const newSchedule = {};
            dateList.forEach(date => { newSchedule[date] = []; });
            setSchedule(newSchedule);
        })
        .catch(() => alert('여행 정보 로드 실패'));

        // 2. 장소목록 불러오기 (planner_items)
        axios.get(`${API_URL}/planner/items`, {
            params: { plannerId },
            headers: { 'x-api-key': API_KEY }
        })
        .then(res => {
            const items = res.data.items || [];
            const sortedSchedule = {};
            const unassignedItems = [];

            items.forEach(item => {
                if (item.visit_date) {
                    const date = item.visit_date;
                    if (!sortedSchedule[date]) sortedSchedule[date] = [];
                    sortedSchedule[date].push(item);
                } else {
                    // 방문일자 없는 데이터 → 장바구니로
                    unassignedItems.push(item);
                }
            });

            // 날짜별로 sequence로 정렬
            Object.keys(sortedSchedule).forEach(date => {
                sortedSchedule[date].sort((a, b) => a.sequence - b.sequence);
            });

            setSchedule(sortedSchedule);
            setCartItems(unassignedItems);
        })
        .catch(() => alert('장소 정보 로드 실패'));
    }, [plannerId]);

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

    // DragDrop 라이브러리
    

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
                        <button
                            className="save-button"
                            onClick={handleSave}
                            disabled={isSaving }
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