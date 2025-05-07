// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/LoginPage.css';
import { registerUser } from '../assets/components/Databaseapi.jsx';
import { loginUser } from '../assets/components/Databaseapi';

const N_CLIENT_ID = import.meta.env.VITE_NAVER_LOGIN_CLIENT_ID;
const N_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI;


function LoginPage() {
    //네이버 로그인 
    const handleNaverLogin = () => {
        const state = Math.random().toString(36).substring(2, 15);  // 랜덤 state
        const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${N_CLIENT_ID}&state=${state}&redirect_uri=${N_REDIRECT_URI}`;
        window.location.href = naverLoginUrl; //그냥 URL로 이동시킴
    };

    
    const [formData, setFormData] = useState({
        userid: '',
        password: '',
        confirmPassword: '',
        username: '',
    });
    const [isSignup, setIsSignup] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedIn === 'true');
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const registerForm = () => {
        const newErrors = {};

        if (!formData.userid) {
            newErrors.userid = '아이디를 입력해주세요.';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        } else if (isSignup) {
            if (formData.password.length < 8) {
                newErrors.password = '비밀번호는 8자리 이상이어야 합니다.';
            } else if (!/[A-Z]/.test(formData.password)) {
                newErrors.password = '비밀번호는 대문자를 하나 이상 포함해야 합니다.';
            } else if (!/[0-9]/.test(formData.password) && !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)){
                newErrors.password = '비밀번호는 숫자 또는 특수문자를 하나 이상 포함해야합니다.';
            }
        }

        if (isSignup && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }

        if (isSignup && !formData.username) {
            newErrors.username = '이름을 입력해주세요.';
        }

        // if (isSignup && !formData.email) {
        //     newErrors.email = '이메일을 입력해주세요.';
        // } else if (isSignup && !/\S+@\S+\.\S+/.test(formData.email)) {
        //     newErrors.email = '유효한 이메일 주소를 입력해주세요.';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!registerForm()) {
            return;
        }
    
        if (isSignup) {
            try {
                await registerUser(formData.userid, formData.username, formData.password);
    
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                setIsSignup(false);
                setFormData({ userid: '', password: '', confirmPassword: '', username: '' });
                setErrors({});
            } catch (error) {
                console.error("회원가입 에러 :", error);
                if (error.error && error.error.includes('Duplicate entry')) {
                    setErrors({ ...errors, userid: '이미 사용 중인 아이디입니다.' });
                } else {
                    alert('회원가입 실패: 서버 오류');
                }
            }
        } else {
            // ✅ 로그인 처리 시작
            try {
                console.log("🚀 /api/login 호출 시작!");
<<<<<<< HEAD
                const response = await loginUser(formData.userid, formData.password);
    
                console.log("✅ 로그인 응답:", response);
    
                if (response.userid) {
                    localStorage.setItem('loggedInUserId', response.userid);
                    localStorage.setItem('isLoggedIn', 'true');
                } else {
                    alert('로그인 응답에서 userid를 찾을 수 없습니다.');
                    return;
                }
    
                window.location.href = `/login-success?userid=${encodeURIComponent(response.userid)}`;
=======
                const res = await loginUser(formData.userid, formData.password);
                localStorage.setItem('loggedInUserId', res.userid);
                window.location.href = `/login-success?userid=${encodeURIComponent(formData.userid)}}`;
>>>>>>> 9e22fb38218e5b371413fca5329f51fd2cc69211

            } catch (error) {
                console.error('로그인 실패:', error);
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="login-container">
                <div className="login-box">
                    <h2>{isSignup ? '회원가입' : '로그인'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input type="text" name="userid" placeholder="아이디" value={formData.userid} onChange={handleChange} />
                            {errors.userid && <p className="error-message">{errors.userid}</p>}
                        </div>

                        {isSignup && (
                            <div className="form-group">
                                <input type="text" name="username" placeholder="이름" value={formData.username} onChange={handleChange} />
                                {errors.username && <p className="error-message">{errors.username}</p>}
                            </div>
                        )}
                        {/*
                        {isSignup && (
                            <div className="form-group">
                                <input type="email" name="email" placeholder="이메일" value={formData.email} onChange={handleChange} />
                                {errors.email && <p className="error-message">{errors.email}</p>}
                            </div>
                        )}
                        */}

                        <div className="form-group">
                            <input type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} />
                            {errors.password && <p className="error-message">{errors.password}</p>}
                        </div>

                        {isSignup && (
                            <div className="form-group">
                                <input type="password" name="confirmPassword" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={handleChange} />
                                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        <button type="submit">{isSignup ? '회원가입' : '로그인'}</button>
                    </form>
                    <p className="switch-auth" onClick={() => {
                        setIsSignup(!isSignup);
                        setFormData({ userid: '', password: '', confirmPassword: '', username: ''});
                        setErrors({});
                    }}>
                        {isSignup ? '로그인하러 가기' : '회원가입하러 가기'}
                    </p>
                    <button onClick={handleNaverLogin}>네이버 로그인</button>
                </div>
            </div>
        </>
    );
}

export default LoginPage;