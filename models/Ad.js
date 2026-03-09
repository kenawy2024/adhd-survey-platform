const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: {
    type: String,
    enum: ['homepage_banner', 'sidebar', 'survey_top', 'between_questions', 'results_page', 'footer'],
    required: true
  },
  type: { type: String, enum: ['adsense', 'custom_html', 'image'], default: 'adsense' },
  content: { type: String },
  adsenseSlot: { type: String },
  adsenseClient: { type: String },
  imageUrl: { type: String },
  linkUrl: { type: String },
  isActive: { type: Boolean, default: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', adSchema);
