import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/ScheduleSummaryPage.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

const ScheduleSummaryPage = () => {
  const location = useLocation();
  const plannerId = location.state?.plannerId;

  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    if (!plannerId) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/planner/items?plannerId=${plannerId}`);
        // 날짜별로 그룹화
        const grouped = {};
        res.data.items.forEach(item => {
          if (!grouped[item.visit_date]) grouped[item.visit_date] = [];
          grouped[item.visit_date].push(item);
        });
        // [{date, items: [...]}, ...] 형태로 변환
        const arr = Object.entries(grouped).map(([date, items]) => ({ date, items }));
        setScheduleData(arr);
      } catch (err) {
        setScheduleData([]);
      }
    };
    fetchData();
  }, [plannerId]);

  return (
    <>
      <Navbar />
      <div className="schedule-summary-container">
        <h1>🗓 여행 일정 요약</h1>
        {scheduleData.length > 0 ? (
          <div className="schedule-list">
            {scheduleData.map((day, idx) => (
              <div key={idx} className="day-card">
                <h2>
                  {new Date(day.date).toLocaleDateString('ko-KR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                {day.items.map((item, i) => {
                  // 여기서 item을 log로 찍어볼 수 있음 (오류X)
                  console.log("item.photoReference:", item.photoReference); // 👈 반드시 확인!
                  const imgUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photoReference}&key=${GOOGLE_API_KEY}`;
                  console.log("이미지 URL:", imgUrl);
                  return (
                    <div key={i}
                      className="item-box"
                      style={{
                        display: 'flex', alignItems: 'center', marginBottom: '14px'
                      }}>
                      {/* 대표사진 */}
                      {item.photoReference ? (
                        <img
                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photoReference}&key=${GOOGLE_API_KEY}`}
                          alt={item.spotName}
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            marginRight: '18px',
                            background: '#f2f2f2',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      ) : (
                        <img
                          src="/img/no-image.png"
                          alt="이미지 없음"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            marginRight: '18px',
                            background: '#f2f2f2',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      )}

                      <div>
                        <p className="item-name" style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                          {item.spotName}
                        </p>
                        <p className="item-addr" style={{ fontSize: 14, color: '#999' }}>
                          위치: {item.latitude}, {item.longitude}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
            현재 저장된 일정이 없습니다.
          </p>
        )}
      </div>
    </>
  );
}

export default ScheduleSummaryPage;
