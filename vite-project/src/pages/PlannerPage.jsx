import React, { useEffect, useState } from "react";
import PlannerList from "./PlannerList";
import './PlannerPage.css';
console.log("📌 PlannerPage 렌더링됨!");


const PlannerPage = () => {
  const [planners, setPlanners] = useState([]);

  useEffect(() => {
    console.log("📡 fetchPlanners 실행됨!");
    const fetchPlanners = async () => {
      try {
        const res = await fetch("http://localhost:3000/planners", {
          credentials: "include",
        });
        const data = await res.json();
        console.log("📥 받은 데이터:", data);
        setPlanners(data);
      } catch (err) {
        console.error("❌ 플래너 불러오기 실패:", err);
      }
    };

    fetchPlanners();
  }, []);


  return (
    <div className="planner-page">
      <div className="header">
        <h2>✨ 나의 여행 플래너 ✈️</h2>
        <p>여행의 순간들을 멋지게 기록해보세요.</p>
      </div>
      <PlannerList planners={planners} />
    </div>
  );
};

export default PlannerPage;
