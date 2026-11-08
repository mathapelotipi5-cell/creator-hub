require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const User = require('./models/User');

const app = express();
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

// CORS: only allow our own frontend(s)
const allowed = (process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

// Health check (also useful for Render)
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/api/creator/profile', async (req, res, next) => {
  try {
    const user = await User.findOne({ role: 'creator' });
    if (!user) return res.status(404).json({ message: 'Creator profile not found' });
    res.json({ name: user.name, siteName: user.siteName, tagline: user.tagline, intro: user.intro, avatarUrl: user.avatarUrl });
  } catch (error) { next(error); }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/contents', require('./routes/contents').router);
app.use('/api/comments', require('./routes/comments'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});
