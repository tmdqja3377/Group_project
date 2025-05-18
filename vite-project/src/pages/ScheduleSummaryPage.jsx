import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/ScheduleSummaryPage.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const API_URL = 'http://localhost:5001/api';
const API_KEY = '3plus3equal_random';
const userId = localStorage.getItem('loggedInUserId');

function ScheduleSummaryPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // cartItems와 schedule 완전 분리!
    const [tripInfo] = useState(location.state?.tripInfo || null);
    const [schedule, setSchedule] = useState({});
    const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
    const [newDate, setNewDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    function getDateRangeList(startDate, endDate) {
        const result = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            result.push(d.toISOString().split('T')[0]);
        }
        return result;
    }

    useEffect(() => {
        if (tripInfo && tripInfo.startDate && tripInfo.endDate) {
            const dateList = getDateRangeList(tripInfo.startDate, tripInfo.endDate);
            const newSchedule = {};
            dateList.forEach(date => { newSchedule[date] = []; });
            setSchedule(newSchedule);
        }
    }, [tripInfo]);

    // 드래그 핵심: schedule (날짜별), cartItems (내 일정) 각각 완전히 독립!
    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        // cart(내 일정)에서 날짜로 이동
        if (source.droppableId === 'cart' && schedule[destination.droppableId]) {
            const newCart = Array.from(cartItems);
            const [movedItem] = newCart.splice(source.index, 1);

            const newSchedule = { ...schedule };
            newSchedule[destination.droppableId] = [
                ...newSchedule[destination.droppableId]
            ];
            newSchedule[destination.droppableId].splice(destination.index, 0, movedItem);

            setCartItems(newCart);
            setSchedule(newSchedule);
            return;
        }

        // 날짜에서 날짜로 이동
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

        // 날짜에서 cart(내 일정)로 이동
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

    const handleAddDate = () => {
        if (!newDate) return alert('날짜를 입력하세요.');
        if (schedule[newDate]) return alert('이미 존재하는 날짜입니다.');
        setSchedule({ ...schedule, [newDate]: [] });
        setNewDate('');
    };

    const handleDeleteItem = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        // 유효성 검사
        if (
            Object.values(schedule).every((items) => items.length === 0)
        ) {
            alert('모든 날짜에 최소 1개 이상 장소를 배치해야 저장할 수 있습니다.');
            return;
        }
        setIsSaving(true);
        try {
            // 1. 플래너 생성
            const res = await axios.post(`${API_URL}/planner/create`, {
                user_id: userId,
                title: tripInfo.title || `${tripInfo.region?.name} 여행`,
                start_date: tripInfo.startDate,
                end_date: tripInfo.endDate,
                travelers: tripInfo.travelers,
                region_name: tripInfo.region?.name,
                lat: tripInfo.region?.lat,
                lng: tripInfo.region?.lng,
            }, { headers: { 'x-api-key': API_KEY } });

            const plannerId = res.data.planner_id;

            // 2. 날짜별 장소 DB에 저장 (planner_items에)
            const savePromises = [];
            Object.entries(schedule).forEach(([date, items]) => {
                items.forEach((item, idx) => {
                    savePromises.push(
                        axios.post(`${API_URL}/planner/add-item`, {
                            userId,
                            plannerId,
                            visitDate: date, // <--- 날짜별 visit_date!
                            sequence: idx,
                            latitude: item.latitude,
                            longitude: item.longitude,
                            spotName: item.name,
                        }, { headers: { 'x-api-key': API_KEY } })
                    );
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
                                    <p><strong>지역:</strong> {tripInfo.region?.name}</p>
                                    <p><strong>날짜:</strong> {tripInfo.startDate} ~ {tripInfo.endDate}</p>
                                    <p><strong>인원수:</strong> {tripInfo.travelers}명</p>
                                </div>
                            )}
                        </div>

                        {/* 날짜별 Droppable 영역 - sch- prefix만 사용 */}
                        {Object.keys(schedule).map((date) => (
                            <Droppable droppableId={date} key={date}>
                                {(provided) => (
                                    <div className="schedule-day" ref={provided.innerRef} {...provided.droppableProps}>
                                        <h3>{date}</h3>
                                        {schedule[date].map((item, index) => (
                                            <Draggable
                                                key={`sch-${date}-${item.spot_id ? item.spot_id : 'idx-' + index}`}
                                                draggableId={`sch-${date}-${item.spot_id ? item.spot_id : 'idx-' + index}`}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        className="schedule-item"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        📍 {item.name}
                                                        {/* ▼ 추가: 삭제 버튼 */}
                                                        <button
                                                        className="delete-button"
                                                        style={{ marginLeft: 8 }}
                                                        onClick={() => {
                                                          // 내 일정(카트)로 다시 보내기
                                                          setCartItems(prev => [...prev, item]);
                                                          // 현재 날짜 일정에서 삭제
                                                          setSchedule(prev => ({
                                                            ...prev,
                                                            [date]: prev[date].filter((_, i) => i !== index)
                                                          }));
                                                          }}
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

                    {/* 오른쪽 내 일정(장바구니) Droppable - cart- prefix만 사용 */}
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
                                                key={`cart-${item.spot_id ? item.spot_id : 'idx-' + index}`}
                                                draggableId={`cart-${item.spot_id ? item.spot_id : 'idx-' + index}`}
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
                                                            <strong>{item.name}</strong>
                                                            <button
                                                                className="delete-button"
                                                                onClick={() => handleDeleteItem(index)}
                                                            >
                                                                삭제
                                                            </button>
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
}

export default ScheduleSummaryPage;
