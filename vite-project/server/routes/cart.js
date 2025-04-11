// routes/cart.cjs
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: '카트 라우터 동작 중' });
});

export default router;
