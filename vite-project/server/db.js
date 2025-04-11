// server/db.js
import mysql from 'mysql2/promise';
export default async function connectDB() {
  const connection = await mysql.createConnection({
    host: 'database-1.cj4uigcomkgm.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: 'carryApw12!',
    database: 'CarryAdb'
  });
  


  console.log('✅ MySQL 연결 성공!');
  return connection;
}
