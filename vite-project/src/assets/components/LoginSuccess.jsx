// src/pages/LoginSuccessPage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasRun = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userid = params.get('userid');
        const username = params.get('name');

        if (userid) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUserId', userid);
            navigate('/');
        } else {
            alert('로그인 정보가 잘못되었습니다.');
            navigate('/login');
        }
    }, [navigate, location]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (localStorage.getItem('isLoggedIn') === 'true') {
                navigator.sendBeacon('http://localhost:5000/api/logout');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUserId');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        let timer;
        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                console.log('비활성 감지, 자동 로그아웃...');
                if (localStorage.getItem('isLoggedIn') === 'true') {
                    navigator.sendBeacon('http://localhost:5000/api/logout');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('loggedInUserId');
                    window.location.href = '/login';
                }
            }, 5 * 1000); // 테스트용 5초, 실제 적용 시 10 * 60 * 1000 (10분)
        };

        resetTimer();

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('scroll', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        window.addEventListener('click', resetTimer);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            window.removeEventListener('click', resetTimer);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div>로그인 중...</div>
    );
}

export default LoginSuccess;
