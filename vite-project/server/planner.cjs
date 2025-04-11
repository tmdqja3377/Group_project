import express from 'express';
import db from '../db.cjs';

const router = express.Router();

// 특정 유저의 플래너 목록
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM planners WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB Error', error: err });
  }
});

export default router;
