const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET all active surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await db.surveys.findAsync({ isActive: true });
    surveys.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ success: true, data: surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single survey by slug
router.get('/:slug', async (req, res) => {
  try {
    const survey = await db.surveys.findOneAsync({ slug: req.params.slug, isActive: true });
    if (!survey) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });
    res.json({ success: true, data: survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit survey response
router.post('/:slug/submit', async (req, res) => {
  try {
    const survey = await db.surveys.findOneAsync({ slug: req.params.slug, isActive: true });
    if (!survey) return res.status(404).json({ success: false, message: 'الاستبيان غير موجود' });

    const { answers, sessionId } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'الإجابات مطلوبة' });
    }

    let totalScore = 0;
    let maxPossibleScore = 0;
    const processedAnswers = [];

    for (const question of survey.questions) {
      const maxOption = Math.max(...question.answerOptions.map(o => o.score));
      maxPossibleScore += maxOption;

      const answer = answers.find(a => a.questionId === question._id);
      if (answer) {
        const option = question.answerOptions.find(o => o.text === answer.selectedOption);
        if (option) {
          totalScore += option.score;
          processedAnswers.push({
            questionId: question._id,
            questionText: question.text,
            selectedOption: answer.selectedOption,
            score: option.score
          });
        }
      }
    }

    // Determine result category
    let resultLabel = '';
    let resultDescription = '';
    let resultColor = '';

    for (const rule of (survey.scoringRules || [])) {
      if (totalScore >= rule.minScore && totalScore <= rule.maxScore) {
        resultLabel = rule.label;
        resultDescription = rule.description;
        resultColor = rule.color;
        break;
      }
    }

    const responseDoc = {
      surveyId: survey._id,
      surveyTitle: survey.title,
      answers: processedAnswers,
      totalScore,
      maxPossibleScore,
      resultLabel,
      resultDescription,
      resultColor,
      sessionId: sessionId || '',
      userAgent: req.headers['user-agent'] || '',
      completedAt: new Date()
    };

    const saved = await db.responses.insertAsync(responseDoc);

    // Update survey stats
    const allResponses = await db.responses.findAsync({ surveyId: survey._id });
    const avgScore = allResponses.reduce((s, r) => s + r.totalScore, 0) / allResponses.length;
    await db.surveys.updateAsync({ _id: survey._id }, {
      $set: { totalResponses: allResponses.length, averageScore: Math.round(avgScore * 10) / 10 }
    });

    res.json({
      success: true,
      data: {
        responseId: saved._id,
        totalScore,
        maxPossibleScore,
        percentage: Math.round((totalScore / maxPossibleScore) * 100),
        resultLabel,
        resultDescription,
        resultColor,
        answers: processedAnswers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
