const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  questionText: String,
  selectedOption: String,
  score: Number
});

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  surveyTitle: String,
  answers: [answerSchema],
  totalScore: { type: Number, required: true },
  maxPossibleScore: Number,
  resultLabel: String,
  resultDescription: String,
  resultColor: String,
  sessionId: String,
  userAgent: String,
  ipAddress: String,
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', responseSchema);
