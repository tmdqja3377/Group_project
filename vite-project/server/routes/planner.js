// routes/planner.js
import express from 'express';
import connectDB from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.session.userId;
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      'SELECT id, title, description, created_at FROM planners WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
    await db.end();
  } catch (err) {
    console.error('플래너 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

export default router;
