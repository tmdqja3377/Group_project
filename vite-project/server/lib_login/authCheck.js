// server/lib_login/authCheck.js

export default function authCheck(req, res, next) {
  if (req.session && req.session.is_logined) {
    next();
  } else {
    res.status(401).json({ message: '로그인이 필요합니다.' });
  }
}
