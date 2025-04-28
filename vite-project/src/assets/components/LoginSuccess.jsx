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
            localStorage.setItem('currentUser', userid);
            navigate('/');
        } else {
            alert('로그인 정보가 잘못되었습니다.');
            navigate('/login');
        }
    }, [navigate, location]);

    return (
        <div>로그인 중...</div>
    );
}

export default LoginSuccess;
