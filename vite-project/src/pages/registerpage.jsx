import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginpage.css';

function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    fetch('http://localhost:3000/auth/register_process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: form.username,
        pwd: form.password,
        pwd2: form.confirmPassword,
      }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 201) {
          alert(data.message);
          navigate('/login');
        } else if (status === 409) {
          setError('이미 존재하는 아이디입니다.');
          setForm({ ...form, username: '' }); // 아이디만 리셋
        } else {
          setError(data.message || '회원가입 실패');
        }
      })
      .catch((err) => {
        console.error('회원가입 오류:', err);
        setError('서버 오류로 인해 회원가입에 실패했습니다.');
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>회원가입</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          placeholder="아이디"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default RegisterPage;
