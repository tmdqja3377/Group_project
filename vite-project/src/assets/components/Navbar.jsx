// src/components/Navbar.js
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../css/Navbar.css';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedIn === 'true');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInPassword');
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
                <Link to="/chatbot" className="nav-button">
                    AI
                </Link>
                {isLoggedIn && (
                    <Link to="/mypage" className="nav-button">
                        마이페이지
                    </Link>
                )}
                {isLoggedIn ? (
                    <button className="nav-button login-button" onClick={handleLogout}>
                        로그아웃
                    </button>
                ) : (
                    <Link to="/login" className="nav-button login-button">
                        로그인
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
