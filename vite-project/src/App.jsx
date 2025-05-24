import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import 'react-date-range/dist/styles.css'; // calendar main style
import 'react-date-range/dist/theme/default.css'; // calendar theme css

import Home from './pages/Home.jsx';
import Login from "./pages/LoginPage.jsx";
import LocationListPage from './pages/LocationListPage.jsx';
import CartPage from "./pages/CartPage.jsx";
import MyPage from './pages/MyPage.jsx';
import AIPromptPage from './pages/AIPromptPage.jsx';
import NaverCallback from './assets/components/Naverlogincallback.jsx';
import LoginSuccess from './assets/components/LoginSuccess.jsx';
import ScheduleSummaryPage from './pages/ScheduleSummaryPage.jsx';
import WeatherPage from './pages/WeatherPage.jsx'; // ✅ 날씨 페이지 import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/location" element={<LocationListPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/chatbot" element={<AIPromptPage />} />
        <Route path="/naver/callback" element={<NaverCallback />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/schedule-summary" element={<ScheduleSummaryPage />} />
        <Route path="/weather" element={<WeatherPage />} /> {/* ✅ 날씨 라우트 추가 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
