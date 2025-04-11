import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginpage.css';

function LoginPage({ setIsLoggedIn }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      alert('아이디와 비밀번호를 입력하세요');
      return;
    }

    fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === '로그인 성공') {
          alert(data.message);
          setIsLoggedIn(true);
          navigate('/');
        } else {
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error('로그인 오류:', err);
        alert('서버 오류입니다.');
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">로그인</button>
        <button
          type="button"
          className="signup-button"
          onClick={() => navigate('/register')}
        >
          회원가입
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
