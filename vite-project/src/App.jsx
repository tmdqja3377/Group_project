import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import LocationListPage from './pages/LocationListPage.jsx';
import Home from './pages/Home.jsx';
import Navbar from "./assets/components/Navbar.jsx";
import Login from "./pages/LoginPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import MyPage from './pages/MyPage.jsx';
import AIPromptPage from './pages/AIPromptPage.jsx'; // ✅ 추가

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/location" element={<LocationListPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Cart" element={<CartPage />} />
        <Route path="/ai" element={<AIPromptPage />} /> {/* ✅ AI 페이지 라우트 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
