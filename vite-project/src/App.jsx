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
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
      navigator.sendBeacon('http://localhost:5000/api/logout');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('token'); // 필요 시 토큰도 정리
    }

    // 현재 경로를 확인하여 리디렉션 경로를 결정합니다.
    if (window.location.pathname === '/') {
      // 현재 페이지가 홈('/')이면 홈으로 리디렉션 (페이지 새로고침 효과)
      window.location.href = '/';
      // 또는 window.location.reload(); 를 사용하여 현재 페이지를 새로고침 할 수도 있습니다.
      // 홈 컴포넌트가 localStorage의 로그인 상태를 감지하여 UI를 업데이트한다면 reload()가 더 적합할 수 있습니다.
    } else {
      // 다른 페이지에 있었다면 로그인 페이지로 리디렉션
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        // navigator.sendBeacon은 페이지가 닫히기 직전에 안정적으로 요청을 보낼 수 있습니다.
        // 동기적인 localStorage 제거는 여기서 반드시 필요한 것은 아닐 수 있으나, 일관성을 위해 유지합니다.
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

    // 사용자가 로그인 상태일 때만 타이머를 설정합니다.
    // 로그인 상태가 아니면 자동 로그아웃 타이머를 실행할 필요가 없습니다.
    if (localStorage.getItem('isLoggedIn') === 'true') {
      resetTimer(); // 초기에 타이머 시작

      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      window.addEventListener('click', resetTimer);
    }


    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 로그인 상태였을 때만 이벤트 리스너를 제거합니다.
      if (localStorage.getItem('isLoggedIn') === 'true' || timer) { // 타이머가 설정된 적이 있다면
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
        window.removeEventListener('scroll', resetTimer);
        window.removeEventListener('touchstart', resetTimer);
        window.removeEventListener('click', resetTimer);
      }
      clearTimeout(timer);
    };
    // useEffect의 dependency array에 logout 함수를 추가하여
    // logout 함수가 변경될 때 (이론적으로는 변경되지 않지만) useEffect가 재실행되도록 합니다.
    // 또는, logout 함수를 useCallback으로 감싸서 의존성 배열에서 제외할 수도 있습니다.
    // 여기서는 logout 함수가 App 컴포넌트 스코프 내에 있고 외부 상태에 의존하지 않으므로
    // 빈 배열로 두어도 큰 문제는 없으나, 명시적으로 logout을 추가하거나 useCallback을 고려할 수 있습니다.
    // 하지만 현재 logout 함수는 외부의 window.location에 의존하므로,
    // react-router-dom의 useNavigate, useLocation 훅을 사용하는 것이 더 React스러운 접근 방식입니다.
    // 그럴 경우 해당 훅들을 useEffect의 의존성 배열에 추가해야 합니다.
    // 여기서는 제공된 코드 구조를 최대한 유지하며 수정합니다.
  }, []); // logout 함수가 재생성되지 않도록 하거나, useCallback으로 감싸고 의존성 배열에 추가하는 것을 고려할 수 있습니다.

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