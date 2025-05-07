// src/pages/MyPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/App.css';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/MyPage.css';
import { getUserInfo, deleteUser, updateUserProfile, changeUserPassword } from '../assets/components/Databaseapi.jsx';

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

function UserInfo({ userData }) {
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({ ...userData });
    const [previewImage, setPreviewImage] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    if (!userData) {
        return <p>사용자 정보를 불러오는 중입니다...</p>;
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setEditData((prev) => ({
                    ...prev,
                    profileImage: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        try {
            await changeUserPassword({
                userid: userData.userid,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            alert(error.error || '비밀번호 변경 실패');
        }
    };

    const handleSave = async () => {
        try {
            const updatedData = {
                userid: userData.userid,
                name: editData.name
            };
            await updateUserProfile(updatedData);
            alert('프로필이 성공적으로 수정되었습니다.');
            setShowEdit(false);
            window.location.reload();
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            alert('프로필 수정 실패');
        }
    };

    return (
        <div className="user-profile-container">
            <div className="profile-image">
                <img src={editData.profileImage || '/img/pro.png'} alt="프로필 이미지" />
            </div>
            <div className="profile-divider"></div>
            <div className="user-info">
                <p>
                    <strong>이름:</strong> {userData.name}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                    <button className="profile-btn" onClick={() => setShowDetail(true)}>
                        상세보기
                    </button>
                    <button className="profile-btn" onClick={() => setShowEdit(true)}>
                        수정하기
                    </button>
                </div>
                <Modal open={showDetail} onClose={() => setShowDetail(false)} title="프로필 상세보기">
                    <div className="profile-detail-content">
                        <div className="profile-detail-image">
                            <img src={userData.profileImage || '/img/pro.png'} alt="프로필 이미지" />
                        </div>
                        <div className="profile-detail-info">
                            <p><strong>이름:</strong> {userData.name}</p>
                        </div>
                    </div>
                </Modal>
                <Modal open={showEdit} onClose={() => setShowEdit(false)} title="프로필 수정">
                    <div className="profile-edit-form">
                        <div className="form-group">
                            <label>프로필 이미지</label>
                            <div className="image-upload-container">
                                <div className="image-preview">
                                    <img
                                        src={previewImage || editData.profileImage || '/img/pro.png'}
                                        alt="프로필 미리보기"
                                    />
                                </div>
                                <label className="image-upload-button">
                                    이미지 선택
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="image-upload-input"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>이름</label>
                            <input type="text" name="name" value={editData.name || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>현재 비밀번호</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="현재 비밀번호를 입력하세요"
                            />
                        </div>
                        <div className="form-group">
                            <label>새 비밀번호</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="새 비밀번호를 입력하세요"
                            />
                        </div>
                        <div className="form-group">
                            <label>새 비밀번호 확인</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="새 비밀번호를 다시 입력하세요"
                            />
                        </div>
                        <div className="form-buttons">
                            <button className="save-btn" onClick={handlePasswordSave}>
                                비밀번호 변경
                            </button>
                            <button className="save-btn" onClick={handleSave}>
                                프로필 저장
                            </button>
                            <button className="cancel-btn" onClick={() => setShowEdit(false)}>
                                취소
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

function TravelCard({ plan }) {
    return (
        <div className="travel-card">
            <h4>{plan.title}</h4>
            <p>
                <strong>여행 일자:</strong> {plan.date}
            </p>
            <p>
                <strong>인원:</strong> {plan.people}명
            </p>
            <p className="travel-desc">{plan.desc}</p>
        </div>
    );
}

function MyPage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const travelPlanListRef = useRef(null);

    const travelPlans = [
        {
            title: '서울 여행 일정',
            date: '2024-07-01 ~ 2024-07-03',
            people: 3,
            desc: '서울의 주요 명소와 맛집을 둘러보는 2박 3일 여행입니다.',
        },
        {
            title: '부산 바다 여행',
            date: '2024-08-10 ~ 2024-08-12',
            people: 2,
            desc: '해운대, 광안리 등 부산의 아름다운 해변을 즐기는 여행.',
        },
        {
            title: '제주도 자연 여행',
            date: '2024-09-15 ~ 2024-09-18',
            people: 4,
            desc: '한라산 등반과 제주의 아름다운 자연을 즐기는 3박 4일 여행.',
        },
        {
            title: '경주 역사 여행',
            date: '2024-10-05 ~ 2024-10-07',
            people: 2,
            desc: '경주의 유적지와 문화재를 탐방하는 2박 3일 여행.',
        },
    ];

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        const userId = localStorage.getItem('loggedInUserId');

        if (loggedIn !== 'true' || !userId) {
            navigate('/login');
        } else {
            const fetchUser = async () => {
                try {
                    const res = await getUserInfo(userId);
                    setUserData(res);
                } catch (err) {
                    console.error('사용자 정보 불러오기 실패:', err);
                    setError('사용자 정보를 불러오지 못했습니다.');
                } finally {
                    setLoading(false);
                }
            };
            fetchUser();
        }
    }, [navigate]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (travelPlanListRef.current) {
                e.preventDefault();
                travelPlanListRef.current.scrollLeft += e.deltaY;
            }
        };

        const el = travelPlanListRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const handleDeleteUser = async () => {
        if (window.confirm('정말로 탈퇴하시겠습니까?')) {
            try {
                await deleteUser(userData.userid);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUserId');
                navigate('/login');
            } catch (err) {
                alert('회원 탈퇴 실패');
            }
        }
    };

    return (
        <div className="mypage-container">
            <Navbar />
            <div className="mypage-box">
                <h2>{userData?.username}님의 프로필</h2>
                <div className="mypage-content">
                    {loading && <p>로딩 중...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {userData && <UserInfo userData={userData} onDelete={handleDeleteUser} />}
                </div>
            </div>
            <div className="travel-plan-list" ref={travelPlanListRef}>
                <div className="travel-card-list">
                    {travelPlans.map((plan, index) => (
                        <TravelCard key={index} plan={plan} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyPage;