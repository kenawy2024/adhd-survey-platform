const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Admin = require('../models/Admin');
const Ad = require('../models/Ad');
const { protect } = require('../middleware/auth');

// POST admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

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
    const surveys = await Survey.find({ isActive: true });
    const allResponses = await Response.find({});
    const totalResponses = allResponses.length;

    const recentResponses = allResponses
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10);

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
    const surveys = await Survey.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single survey (admin)
router.get('/surveys/:id', protect, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
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

    const processedQuestions = (questions || []).map((q, i) => ({
      text: q.text,
      order: q.order || i + 1,
      answerOptions: q.answerOptions || []
    }));

    const survey = await Survey.create({
      title, slug, description,
      category: category || 'ADHD',
      icon: icon || '🧠',
      estimatedMinutes: estimatedMinutes || 5,
      isActive: isActive !== false,
      questions: processedQuestions,
      scoringRules: scoringRules || [],
      totalResponses: 0,
      averageScore: 0
    });
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
      text: q.text,
      order: q.order || i + 1,
      answerOptions: q.answerOptions || []
    }));

    const updated = await Survey.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, category, icon, estimatedMinutes, questions: processedQuestions, scoringRules, isActive, updatedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE survey
router.delete('/surveys/:id', protect, async (req, res) => {
  try {
    const deleted = await Survey.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });
    res.json({ success: true, message: 'تم حذف الاستبيان بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET survey responses
router.get('/surveys/:id/responses', protect, async (req, res) => {
  try {
    const responses = await Response.find({ surveyId: req.params.id }).sort({ completedAt: -1 }).limit(100);
    res.json({ success: true, data: responses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ADS ---
router.get('/ads', protect, async (req, res) => {
  try {
    const ads = await Ad.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/ads', protect, async (req, res) => {
  try {
    const ad = await Ad.create({ ...req.body, impressions: 0, clicks: 0 });
    res.status(201).json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/ads/:id', protect, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!ad) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/ads/:id', protect, async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الإعلان' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
