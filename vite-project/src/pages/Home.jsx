// src/pages/Home.js
import { useNavigate } from 'react-router-dom';
import Navbar from '../assets/components/Navbar.jsx'; // ✅ Navbar 컴포넌트 추가
import '../assets/css/Home.css';

function Home() {
    const navigate = useNavigate();

    const goPage = () => {
            navigate('/location');
    };

    return (
        <>
            <Navbar /> {/* ✅ 공통 네비게이션 바 사용 */}
            <div className="container">
                <div className="content">
                    <div className='inner-content'>
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
                            <button className="start-button" onClick={goPage}>
                                플래너 시작하기
                            </button>
                        </div>
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
