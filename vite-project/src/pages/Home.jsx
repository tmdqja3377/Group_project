// src/pages/Home.jsx

import '../../public/css/Appv.css';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    const handleStartClick = () => {
        navigate('/planner');
    };

    return (
        <>
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
                        고민만 하던 여행 계획을 <span className="highlight">CarryA</span>을 통해 몇 분 만에 스케줄링
                        해보세요.
                    </p>
                    <div className="button-box">
                        <button className="start-button" onClick={handleStartClick}>
                            시작하기
                        </button>
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
