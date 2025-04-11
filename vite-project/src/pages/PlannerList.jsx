// src/pages/PlannerList.jsx
import React from "react";
import "./PlannerList.css";

const PlannerList = ({ planners }) => {
  if (!planners || planners.length === 0) {
    return <div className="planner-empty">플래너가 없습니다.</div>;
  }

  return (
    <div className="planner-list">
      {planners.map((planner) => (
        <div key={planner.id} className="planner-card">
          <h3>{planner.title}</h3>
          <p>{planner.description}</p>
          <span className="planner-date">{new Date(planner.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
};

export default PlannerList;
