// src/pages/LoginSuccessPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginSuccessPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userid = params.get('userid');
        const username = params.get('username');

        if (userid) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', userid);
            if (username) {
                localStorage.setItem('username', username);
            }
        }

        // 홈으로 자동 이동
        navigate('/');
    }, []);

    return (
        <div>로그인 중...</div>
    );
}

export default LoginSuccessPage;
