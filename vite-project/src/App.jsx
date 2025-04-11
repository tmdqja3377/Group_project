import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from 'react';

import Navibar from "./assets/components/Navibar";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/registerpage";
import PlannerPage from "./pages/PlannerPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Navibar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/planner" element={<PlannerPage />} /> {/* ✅ 추가된 부분 */}
        <Route path="/tourist" element={<TouristSpotPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
