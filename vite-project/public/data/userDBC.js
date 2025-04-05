import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: import.meta.env.DB_HOST,
  port: import.meta.env.DB_PORT,
  user: import.meta.env.DB_USER,
  password: import.meta.env.DB_PASSWORD,
  database: import.meta.env.DB_NAME
});

console.log('✅ MySQL 연결 성공!');
export default connection;