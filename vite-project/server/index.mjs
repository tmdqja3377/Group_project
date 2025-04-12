// server/index.mjs
import authRouter from './lib_login/auth.js';
import authCheck from './lib_login/authCheck.js';
import plannerRoutes from './routes/planner.js';

const FileStore = FileStoreFactory(session);
const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,        
    sameSite: 'lax'         
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);

// 플래너 조회 API
app.get('/planners', authCheck, async (req, res) => {
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

app.use('/api/planners',authCheck, plannerRoutes);
app.use('/api/cart', cartRoutes);
// lib_login/auth.js 안에 라우터 함수 내부:
app.use('/tourist-spots', touristSpotsRouter);

app.listen(port, () => {
  console.log(`✅ 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

