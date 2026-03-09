const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET public ads by position
router.get('/:position', async (req, res) => {
  try {
    const ads = await db.ads.findAsync({ position: req.params.position, isActive: true });
    // Track impressions (fire and forget)
    for (const ad of ads) {
      db.ads.updateAsync({ _id: ad._id }, { $inc: { impressions: 1 } }).catch(() => {});
    }
    res.json({ success: true, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST track click
router.post('/:id/click', async (req, res) => {
  try {
    await db.ads.updateAsync({ _id: req.params.id }, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
