import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../css/Navbar.css';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = localStorage.getItem('isLoggedIn');
            setIsLoggedIn(loggedIn === 'true');
        };
        checkLogin();
        window.addEventListener('storage', checkLogin);
        return () => {
            window.removeEventListener('storage', checkLogin);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/">
                    <img src="/img/logo.png" alt="로고" />
                </Link>
            </div>
            <div className="nav-buttons">
                <Link to="/location" className="nav-button">여행지</Link>
                <Link to="/weather" className="nav-button">날씨</Link>
                {/* ✅ 항공권 버튼 - 외부 링크 새 창으로 */}
                <a href="https://flight.naver.com/" target="_blank" rel="noopener noreferrer" className="nav-button">
                    항공권
                </a>

                {isLoggedIn && (
                    <Link to="/mypage" className="nav-button">마이페이지</Link>
                )}
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="nav-button logout-button">로그아웃</button>
                ) : (
                    <Link to="/login" className="nav-button login-button">로그인</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
