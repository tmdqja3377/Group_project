// routes/touristSpots.js
import express from 'express';
import connectDB from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute('SELECT * FROM tourist_spots ORDER BY data_date DESC');
    res.json(rows);
    await db.end();
  } catch (err) {
    console.error('관광지 데이터 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

export default router;
