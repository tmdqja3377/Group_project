import React, { useEffect, useState } from 'react';
import Navbar from '../assets/components/Navbar';
import '../assets/css/ScheduleSummaryPage.css';

const ScheduleSummaryPage = () => {
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    // 나중에 여기에 localStorage나 API 연동하면 됨
    const storedData = JSON.parse(localStorage.getItem('plannedSchedule')) || [];
    setScheduleData(storedData);
  }, []);

  return (
    <>
      <Navbar />
      <div className="schedule-summary-container">
        <h1>🗓 여행 일정 요약</h1>

        {scheduleData.length > 0 ? (
          <div className="schedule-list">
            {scheduleData.map((day, idx) => (
              <div key={idx} className="day-card">
                <h2>{new Date(day.date).toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>

                {day.restaurant && (
                  <div className="day-section">
                    <h3>🍽 음식점</h3>
                    <div className="item-box">
                      <img src={day.restaurant.image} alt="Restaurant" />
                      <div>
                        <p className="item-name">{day.restaurant.name} ⭐ {day.restaurant.rating}</p>
                        <p className="item-address">{day.restaurant.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {day.hotel && (
                  <div className="day-section">
                    <h3>🏨 호텔</h3>
                    <div className="item-box">
                      <img src={day.hotel.image} alt="Hotel" />
                      <div>
                        <p className="item-name">{day.hotel.name}</p>
                        <p className="item-price">{day.hotel.price}</p>
                      </div>
                    </div>
                  </div>
                )}

                {day.activity && (
                  <div className="day-section">
                    <h3>🎡 즐길 거리</h3>
                    <div className="item-box">
                      <img src={day.activity.image} alt="Activity" />
                      <div>
                        <p className="item-name">{day.activity.name}</p>
                        <p className="item-reviews">{day.activity.reviews.toLocaleString()}명 리뷰</p>
                      </div>
                    </div>
                  </div>
                )}

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
};

export default ScheduleSummaryPage;
