// src/components/Navbar.js
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
    
        // 처음 로딩 때 체크
        checkLogin();
    
        // localStorage 변화를 감지하는 리스너 추가
        window.addEventListener('storage', checkLogin);
    
        // 컴포넌트 언마운트될 때 리스너 제거
        return () => {
            window.removeEventListener('storage', checkLogin);
        };
    }, []);

    
    //로그아웃 함수 생성
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
                <Link to="/location" className="nav-button">
                    여행지
                </Link>
                {isLoggedIn && (
                    <Link to="/mypage" className="nav-button">
                        마이페이지
                    </Link>
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
