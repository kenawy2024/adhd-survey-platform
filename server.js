require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/ads',     require('./routes/ads'));

// Admin SPA fallback
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ متصل بقاعدة البيانات MongoDB');
    app.listen(PORT, () => {
      console.log('');
      console.log('🧠 ============================================');
      console.log(`🚀  منصة ADHD تعمل على http://localhost:${PORT}`);
      console.log(`🔐  لوحة التحكم: http://localhost:${PORT}/admin/login.html`);
      console.log('👤  بيانات الدخول: admin / admin123');
      console.log('🧠 ============================================');
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  });
