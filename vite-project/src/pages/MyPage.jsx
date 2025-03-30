// src/pages/MyPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/App.css';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/MyPage.css';

function UserInfo({ userData, currentUser, onDeleteUser }) {
    if (!userData) {
        return <p>사용자 정보를 불러오는 중입니다...</p>;
    }

    return (
        <>
            <p>
                <strong>아이디:</strong> {currentUser}
            </p>
            <p>
                <strong>이름:</strong> {userData.name}
            </p>
            <p>
                <strong>이메일:</strong> {userData.email}
            </p>
            <button onClick={onDeleteUser}>탈퇴하기</button>
        </>
    );
}

function MyPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        const username = localStorage.getItem('currentUser');

        if (loggedIn !== 'true') {
            navigate('/login');
        } else {
            setCurrentUser(username);
            try {
                const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
                setUserData(storedUsers[username]);
            } catch (err) {
                setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    }, [navigate]);

    const handleDeleteUser = () => {
        if (window.confirm('정말로 탈퇴하시겠습니까?')) {
            const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
            delete storedUsers[currentUser];
            localStorage.setItem('users', JSON.stringify(storedUsers));
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            navigate('/login');
        }
    };

    return (
        <>
            <Navbar />
            <div className="mypage-container">
                <div className="mypage-box">
                    <div className="mypage-sidebar">
                        <button>사용자 정보</button>
                    </div>
                    <div className="mypage-content">
                        <h2>마이페이지</h2>
                        {loading && <p>로딩 중...</p>}
                        {error && <p className="error-message">{error}</p>}
                        {userData && (
                            <UserInfo
                                userData={userData}
                                currentUser={currentUser}
                                onDeleteUser={handleDeleteUser}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default MyPage;