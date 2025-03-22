import { Link } from 'react-router-dom';
import '../App.css'; // 전체 스타일 불러오기

function Home() {
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

            {/* 메인 컨테이너 */}
            <div className="container">
                <div className="content">
                    <div className="text-box">
                        <h1>
                            기존에 경험하지 못한
                            <br />
                            새로운 여행 플래너
                        </h1>
                    </div>
                    <p className="description">
                        고민만 하던 여행 계획을 <span className="highlight">캡스톤</span>을 통해 몇 분 만에 스케줄링
                        해보세요.
                    </p>
                    <div className="button-box">
                        <button className="start-button">시작하기</button>
                    </div>
                    <div className="image-box">
                        <img src="/img/1.png" alt="여행 플래너 이미지" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
