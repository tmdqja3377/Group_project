import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import 'react-date-range/dist/styles.css'; // calendar main style
import 'react-date-range/dist/theme/default.css'; // calendar theme css
import LocationListPage from './pages/LocationListPage.jsx';
import Home from './pages/Home.jsx';
import Login from "./pages/LoginPage.jsx"
import CartPage from "./pages/CartPage.jsx"
import MyPage from './pages/MyPage.jsx';
import AIPromptPage from './pages/AIPromptPage.jsx';
import NaverCallback from './assets/components/Naverlogincallback.jsx'
import LoginSuccess from './assets/components/LoginSuccess.jsx'
import ScheduleSummaryPage from './pages/ScheduleSummaryPage.jsx';



function App() {
  const [setIsLoggedIn] = useState(false);

  const logout = () => {
    console.log("자동 로그아웃 실행됨");
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigator.sendBeacon('http://localhost:5000/api/logout');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('token');
    }
    window.location.href = '/';
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      const navType = navEntry ? navEntry.type : '';

      console.log('[[BeforeUnload Fired]] Navigation Type:', navType, '로그인 상태:', localStorage.getItem('isLoggedIn'));

      // 새로고침, 페이지 이동일 때는 로그아웃하지 않음
      if (navType === 'reload' || navType === 'navigate') {
        return;
      }

      // 창 닫기 시에만 로그아웃
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
      if (localStorage.getItem('isLoggedIn') === 'true') {
        timer = setTimeout(() => {
          console.log("비활성 감지, 자동 로그아웃...");
          logout();
        }, 30 * 60 * 1000); // ✅ 실사용 시 10분 (테스트용은 1 * 60 * 1000으로 변경)
      }
    };

    if (localStorage.getItem('isLoggedIn') === 'true') {
      resetTimer();

      const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
      events.forEach(event => window.addEventListener(event, resetTimer));

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        events.forEach(event => window.removeEventListener(event, resetTimer));
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={ <MyPage />} />
        <Route path="/location" element={<LocationListPage setIsLoggedIn={setIsLoggedIn} />} />
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
