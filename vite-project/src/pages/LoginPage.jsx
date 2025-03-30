// src/pages/LoginPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/LoginPage.css';

function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: ''
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username) {
            newErrors.username = '아이디를 입력해주세요.';
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

        if (isSignup && !formData.name) {
            newErrors.name = '이름을 입력해주세요.';
        }

        if (isSignup && !formData.email) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (isSignup && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '유효한 이메일 주소를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem('users')) || {};

        if (isSignup) {
            if (storedUsers[formData.username]) {
                setErrors({ ...errors, username: '이미 사용 중인 아이디입니다.' });
                return;
            }

            storedUsers[formData.username] = {
                password: formData.password,
                name: formData.name,
                email: formData.email
            };

            localStorage.setItem('users', JSON.stringify(storedUsers));
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            setIsSignup(false);
            setFormData({ username: '', password: '', confirmPassword: '', name: '', email: '' });
            setErrors({});
        } else {
            const userData = storedUsers[formData.username];
            if (userData && userData.password === formData.password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', formData.username);
                setIsLoggedIn(true);
                navigate('/');
            } else {
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
                            <input type="text" name="username" placeholder="아이디" value={formData.username} onChange={handleChange} />
                            {errors.username && <p className="error-message">{errors.username}</p>}
                        </div>

                        {isSignup && (
                            <div className="form-group">
                                <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>
                        )}

                        {isSignup && (
                            <div className="form-group">
                                <input type="email" name="email" placeholder="이메일" value={formData.email} onChange={handleChange} />
                                {errors.email && <p className="error-message">{errors.email}</p>}
                            </div>
                        )}

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
                        setFormData({ username: '', password: '', confirmPassword: '', name: '', email: '' });
                        setErrors({});
                    }}>
                        {isSignup ? '로그인하러 가기' : '회원가입하러 가기'}
                    </p>
                </div>
            </div>
        </>
    );
}

export default LoginPage;