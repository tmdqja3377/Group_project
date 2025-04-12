// server/lib_login/auth.js
import express from 'express';
import connectDB from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  console.log('🔥 로그인 요청 받음:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요' });
  }

  try {
    const db = await connectDB();
    const [results] = await db.execute(
      'SELECT * FROM usertable WHERE username = ? AND password = ?',
      [username, password]
    );

    // 로그인 성공 시
    if (results.length > 0) {
      req.session.is_logined = true;
      req.session.nickname = username;
      req.session.userId = results[0].id; // ✅ userId 세팅!
      req.session.save(() => {
        res.status(200).json({ message: '로그인 성공' });
      });
    }
else {
      res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    await db.end();
  } catch (err) {
    console.error('❌ 로그인 서버 오류:', err); 
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

router.post('/register_process', async (req, res) => {
  const { username, pwd: password, pwd2 } = req.body;

  if (!username || !password || password !== pwd2) {
    return res.status(400).json({ message: '유효한 회원 정보를 입력하세요' });
  }

  try {
    const db = await connectDB();

    const [existingUser] = await db.execute(
      'SELECT * FROM usertable WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      await db.end();
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    await db.execute(
      'INSERT INTO usertable (username, password) VALUES (?, ?)',
      [username, password]
    );

    await db.end();
    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ message: '회원가입 실패', error: err.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: '로그아웃 실패' });
    res.clearCookie('connect.sid');
    res.status(200).json({ message: '로그아웃 성공' });
  });
});

router.get('/check', (req, res) => {
  if (req.session.is_logined) {
    res.status(200).json({ isLoggedIn: true, username: req.session.nickname });
  } else {
    res.status(200).json({ isLoggedIn: false });
  }
});

// ⬇️ ESM 방식의 export
export default router;
