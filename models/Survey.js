const mongoose = require('mongoose');

const answerOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  order: { type: Number, required: true },
  answerOptions: [answerOptionSchema]
});

const scoringRuleSchema = new mongoose.Schema({
  minScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  label: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, default: '#28a745' }
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, default: 'ADHD' },
  icon: { type: String, default: '🧠' },
  estimatedMinutes: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  questions: [questionSchema],
  scoringRules: [scoringRuleSchema],
  totalResponses: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

surveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Survey', surveySchema);
