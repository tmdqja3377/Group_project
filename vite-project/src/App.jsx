import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import 'react-date-range/dist/styles.css'; // calendar main style
import 'react-date-range/dist/theme/default.css'; // calendar theme css
import LocationListPage from './pages/LocationListPage.jsx';
import Home from './pages/Home.jsx';
import Login from "./pages/LoginPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import MyPage from './pages/MyPage.jsx';
import AIPromptPage from './pages/AIPromptPage.jsx';
import NaverCallback from './assets/components/Naverlogincallback.jsx';
import LoginSuccess from './assets/components/LoginSuccess.jsx'; // 로그인 성공 시 'isLoggedIn'을 설정한다고 가정
import ScheduleSummaryPage from './pages/ScheduleSummaryPage.jsx';


function App() {
  // App 자체의 isLoggedIn 상태는 Navbar에 직접 사용되지 않으므로 주석 처리하거나 필요에 따라 사용
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = () => {
    console.log("로그아웃 실행됨"); // 디버그 로그
    // 예: localStorage에 저장된 토큰 삭제
    localStorage.removeItem('token');
    // ** 중요한 변경: Navbar가 읽는 'isLoggedIn' 키도 함께 삭제 **
    localStorage.removeItem('isLoggedIn');
    // setIsLoggedIn(false); // 이 상태는 리다이렉트 시 사라짐

    // 로그아웃 후 로그인 페이지로 이동 (여기서 전체 페이지 새로고침 발생)
    // window.location.href는 App 컴포넌트가 다시 마운트되게 함
    window.location.href = '/login';
  };

  useEffect(() => {
    // 창 닫을 때 로그아웃 (완벽하지 않을 수 있으나 유지)
    const handleBeforeUnload = () => {
      // 토큰이 존재하는 경우에만 로그아웃 처리 (로그인 상태였다면)
      if (localStorage.getItem('token')) {
         // 네비게이션/종료 전에 필요한 스토리지 정리만 수행
         localStorage.removeItem('token');
         localStorage.removeItem('isLoggedIn'); // 여기에서도 확실히 삭제
      }
      // unload 과정에서 window.location.href 호출은 문제를 일으킬 수 있으므로 지양
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 비활성 상태 감지 타이머 (현재 5초로 설정되어 있음, 10분은 10*60*1000)
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("비활성 감지, 로그아웃 실행..."); // 디버그 로그
        logout(); // 이 함수는 토큰과 isLoggedIn을 제거하고 리다이렉트 수행
      }, 5 * 1000); // 10분 (밀리초 단위) -> 실제 10분은 10 * 60 * 1000 으로 변경
    };

    // 처음 로딩 시 타이머 시작
    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    // 모바일/터치 장치를 위해 touchstart, click 이벤트 리스너 추가 고려
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('click', resetTimer);


    // 컴포넌트 언마운트 시 리스너 및 타이머 제거
    return () => {
      console.log("App useEffect 정리"); // 디버그 로그
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer); // touchstart 제거
      window.removeEventListener('click', resetTimer); // click 제거
      clearTimeout(timer);
    };
  }, []); // 빈 의존성 배열: 마운트 시 한 번 실행 및 언마운트 시 정리

  // 참고: App의 isLoggedIn 상태는 Navbar를 직접 제어하는 데 사용되지 않습니다.
  // Navbar는 localStorage에 의존합니다. LoginSuccess/NaverCallback 컴포넌트 (여기에 코드가 없음)는
  // 로그인 성공 시 반드시 localStorage.setItem('isLoggedIn', 'true');를 설정해야
  // Navbar가 초기 로딩 시 '로그아웃' 버튼을 올바르게 표시합니다.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        {/* setIsLoggedIn을 LocationListPage에 전달하는 것은 Navbar에 영향을 주지 않음 */}
        <Route path="/location" element={<LocationListPage /* setIsLoggedIn={setIsLoggedIn} */ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/chatbot" element={<AIPromptPage />} />
        {/* NaverCallback과 LoginSuccess가 localStorage.setItem('isLoggedIn', 'true')를 설정하는지 확인 */}
        <Route path="/naver/callback" element={<NaverCallback />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/schedule-summary" element={<ScheduleSummaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;