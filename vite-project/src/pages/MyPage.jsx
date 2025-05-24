// src/pages/MyPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/App.css';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/MyPage.css';
import { getUserInfo, deleteUser, updateUserProfile, changeUserPassword,  getTravelPlans } from '../assets/components/Databaseapi.jsx';

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
                username: editData.username,         // ✔️ 닉네임 필드 정확히
                profileImage: editData.profileImage  // ✔️ 이미지도 포함
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
                <p><strong>ID:</strong> {userData.userid}</p>
                <p><strong>닉네임:</strong> {userData.username}</p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                    <button className="profile-btn" onClick={() => setShowEdit(true)}>
                        수정하기
                    </button>
                </div>

                {/* 수정 모델 */}
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
                            <label>닉네임</label>
                            <input
                                type="text"
                                name="username"
                                value={editData.username}
                                onChange={(e) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                                placeholder="닉네임을 입력하세요"
                            />
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


function TravelCard({ plan, onClick }) {
    return (
        <div className="travel-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <h4>{plan.title}</h4>
            <p><strong>여행일자:</strong> {plan.start_date} ~ {plan.end_date}</p>
            <p><strong>인원:</strong> {plan.travelers}명</p>
            <p className="travel-desc"><strong>지역:</strong> {plan.region_name}</p>
        </div>
    );
}

function MyPage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [travelPlans, setTravelPlans] = useState([]);

    const navigate = useNavigate();
    const travelPlanListRef = useRef(null);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        const userId = localStorage.getItem('loggedInUserId');

        const fetchPlans = async () => {
            try {
                const plans = await getTravelPlans(userId);
                setTravelPlans(plans);
            } catch (err) {
                console.error('여행 일정 불러오기 실패:', err);
            }
        };

        if (loggedIn !== 'true' || !userId) {
            navigate('/login');
        } else {
            const fetchUser = async () => {
                try {
                    const res = await getUserInfo(userId);
                    // 🔥 snake_case → camelCase 로 변환!
                    setUserData({
                        userid: res.userid,
                        username: res.username,
                        profileImage: res.profile_image || null,  // ✅ 이 줄 필수!
                    });
                } catch (err) {
                    console.error('사용자 정보 불러오기 실패:', err);
                    setError('사용자 정보를 불러오지 못했습니다.');
                } finally {
                    setLoading(false);
                }
            };            
            fetchUser();
            fetchPlans();
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
                    {travelPlans.map((plan, idx) => (
                        <TravelCard
                            key={plan.id || idx}
                            plan={plan}
                            onClick={() => navigate('/schedule-summary', { state: { plannerId: plan.id } })}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyPage;