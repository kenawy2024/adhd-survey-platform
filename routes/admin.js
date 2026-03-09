const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../lib/db');
const { protect } = require('../middleware/auth');

// POST admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await db.admins.findOneAsync({ username });
    if (!admin) return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    await db.admins.updateAsync({ _id: admin._id }, { $set: { lastLogin: new Date() } });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, username: admin.username });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats
router.get('/stats', protect, async (req, res) => {
  try {
    const surveys = await db.surveys.findAsync({ isActive: true });
    const allResponses = await db.responses.findAsync({});
    const totalResponses = allResponses.length;

    // Last 10 responses
    const recentResponses = allResponses
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10);

    // Daily responses last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyMap = {};
    allResponses
      .filter(r => new Date(r.completedAt) >= sevenDaysAgo)
      .forEach(r => {
        const day = new Date(r.completedAt).toISOString().slice(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      });

    const dailyResponses = Object.entries(dailyMap)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => a._id.localeCompare(b._id));

    res.json({
      success: true,
      data: {
        totalSurveys: surveys.length,
        totalResponses,
        surveys: surveys.map(s => ({ _id: s._id, title: s.title, totalResponses: s.totalResponses || 0, averageScore: s.averageScore || 0 })),
        recentResponses,
        dailyResponses
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all surveys (admin)
router.get('/surveys', protect, async (req, res) => {
  try {
    const surveys = await db.surveys.findAsync({});
    surveys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single survey (admin)
router.get('/surveys/:id', protect, async (req, res) => {
  try {
    const survey = await db.surveys.findOneAsync({ _id: req.params.id });
    if (!survey) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });
    res.json({ success: true, data: survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create survey
router.post('/surveys', protect, async (req, res) => {
  try {
    const { title, description, category, icon, estimatedMinutes, questions, scoringRules, isActive } = req.body;
    const slug = encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 60)) + '-' + Date.now();

    // Add _id to each question
    const processedQuestions = (questions || []).map((q, i) => ({
      ...q,
      _id: `q_${Date.now()}_${i}`,
      order: q.order || i + 1
    }));

    const doc = {
      title, slug, description,
      category: category || 'ADHD',
      icon: icon || '🧠',
      estimatedMinutes: estimatedMinutes || 5,
      isActive: isActive !== false,
      questions: processedQuestions,
      scoringRules: scoringRules || [],
      totalResponses: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const survey = await db.surveys.insertAsync(doc);
    res.status(201).json({ success: true, data: survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update survey
router.put('/surveys/:id', protect, async (req, res) => {
  try {
    const { title, description, category, icon, estimatedMinutes, questions, scoringRules, isActive } = req.body;

    const processedQuestions = (questions || []).map((q, i) => ({
      ...q,
      _id: q._id || `q_${Date.now()}_${i}`,
      order: q.order || i + 1
    }));

    await db.surveys.updateAsync(
      { _id: req.params.id },
      { $set: { title, description, category, icon, estimatedMinutes, questions: processedQuestions, scoringRules, isActive, updatedAt: new Date() } }
    );
    const updated = await db.surveys.findOneAsync({ _id: req.params.id });
    if (!updated) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE survey
router.delete('/surveys/:id', protect, async (req, res) => {
  try {
    const n = await db.surveys.removeAsync({ _id: req.params.id }, {});
    if (!n) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });
    res.json({ success: true, message: 'تم حذف الاستبيان بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET survey responses
router.get('/surveys/:id/responses', protect, async (req, res) => {
  try {
    const responses = await db.responses.findAsync({ surveyId: req.params.id });
    responses.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    res.json({ success: true, data: responses.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ADS ---
router.get('/ads', protect, async (req, res) => {
  try {
    const ads = await db.ads.findAsync({});
    ads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/ads', protect, async (req, res) => {
  try {
    const doc = { ...req.body, impressions: 0, clicks: 0, createdAt: new Date() };
    const ad = await db.ads.insertAsync(doc);
    res.status(201).json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/ads/:id', protect, async (req, res) => {
  try {
    await db.ads.updateAsync({ _id: req.params.id }, { $set: req.body });
    const ad = await db.ads.findOneAsync({ _id: req.params.id });
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/ads/:id', protect, async (req, res) => {
  try {
    await db.ads.removeAsync({ _id: req.params.id }, {});
    res.json({ success: true, message: 'تم حذف الإعلان' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
