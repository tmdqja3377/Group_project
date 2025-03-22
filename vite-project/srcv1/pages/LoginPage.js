// src/pages/LoginPage.js
import { Link } from 'react-router-dom';
function LoginPage() {
    return (
        <>
            {/* 네비게이션 바 */}
            <nav className="navbar">
                <div className="logo">
                    <Link to="/">
                        <img src="/img/logo.png" alt="로고" />
                    </Link>
                </div>
                <div className="nav-buttons">
                    <Link to="/spot" className="nav-button">
                        여행지
                    </Link>
                    <Link to="/login" className="nav-button login-button">
                        로그인
                    </Link>
                </div>
            </nav>

            <div className="App">
                <h2 style={{ marginTop: '100px' }}>🔐 로그인 페이지입니다!</h2>
            </div>
        </>
    );
}

export default LoginPage;
