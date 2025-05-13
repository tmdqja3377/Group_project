import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function NaverCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
      const fetchNaverUser = async () => {
          try {
              const urlParams = new URLSearchParams(window.location.search);
              const code = urlParams.get('code');
              const state = urlParams.get('state');

              if (!code || !state) {
                  alert('네이버 로그인 실패');
                  navigate('/login');
                  return;
              }

              // code, state 서버로 보내서 access_token + 사용자 정보 가져오기
              const res = await axios.get(`http://3.39.25.182/naver/callback?code=${code}&state=${state}`);

              const { id, name, email } = res.data;

              console.log('네이버 로그인 성공!', res.data);

              // 이제 서버에 회원가입/로그인 처리 요청
              const loginRes = await axios.post(`http://3.39.25.182/api/naver-login`, {
                  id,
                  name,
                  email: email || ''
              });

              alert(loginRes.data.message);
              // 로컬스토리지에 로그인 상태 저장
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('currentUser', id);
              
              navigate('/');

          } catch (error) {
              console.error('네이버 로그인 에러:', error);
              alert('네이버 로그인 실패');
              navigate('/login');
          }
      };

      fetchNaverUser();
  }, [navigate]);

  return (
      <div>
          네이버 로그인 처리 중...
      </div>
  );
}

export default NaverCallbackPage;