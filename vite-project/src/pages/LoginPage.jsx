import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
    if (isSignup) {
      storedUsers[username] = password;
      localStorage.setItem('users', JSON.stringify(storedUsers));
      setIsSignup(false);
    } else {
      if (storedUsers[username] === password) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }
  };

  return (
    <>
      <div className="App" style={{ marginTop: '100px' }}>
        <h2>{isSignup ? '회원가입' : '로그인'}</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="username">아이디:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </div>
          <button type="submit">{isSignup ? '회원가입' : '로그인'}</button>
        </form>
        <p style={{ marginTop: '10px' }}>
          {isSignup ? (
            <span onClick={() => setIsSignup(false)} style={{ cursor: 'pointer' }}>
              로그인하러 가기
            </span>
          ) : (
            <span onClick={() => setIsSignup(true)} style={{ cursor: 'pointer' }}>
              회원가입하러 가기
            </span>
          )}
        </p>
      </div>
    </>
  );
}

export default LoginPage;
