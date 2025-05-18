import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import LocationListPage from './pages/LocationListPage.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/LoginPage.jsx';
import CartPage from './pages/CartPage.jsx';
import MyPage from './pages/MyPage.jsx';
import AIPromptPage from './pages/AIPromptPage.jsx';
import NaverCallback from './assets/components/Naverlogincallback.jsx';
import LoginSuccess from './assets/components/LoginSuccess.jsx';
import ScheduleSummaryPage from './pages/ScheduleSummaryPage.jsx';

function App() {
  const logout = () => {
    console.log("자동 로그아웃 실행됨");
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigator.sendBeacon('http://localhost:5000/api/logout');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('token'); // 필요 시 토큰도 정리
    }
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        navigator.sendBeacon('http://localhost:5000/api/logout');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUserId');
        localStorage.removeItem('token');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("비활성 감지, 자동 로그아웃...");
        logout();
      }, 5 * 1000); // ✅ 테스트용 5초, 실제 사용 시 10 * 60 * 1000 (10분)
    };

    // 초기에 타이머 시작
    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(timer);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/location" element={<LocationListPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/chatbot" element={<AIPromptPage />} />
        <Route path="/naver/callback" element={<NaverCallback />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/schedule-summary" element={<ScheduleSummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
