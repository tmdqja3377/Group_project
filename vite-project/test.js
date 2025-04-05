import connection from './public/data/userDBC.js';

try {
  const [rows] = await connection.query('SELECT NOW() AS now');
  console.log('현재 시간:', rows[0].now);
} catch (err) {
  console.error('❌ 쿼리 실패:', err.message);
}