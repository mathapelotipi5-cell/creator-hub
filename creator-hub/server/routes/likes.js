const express = require('express');
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Like = require('../models/Like');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { contentId, viewerId } = req.body;
  if (!mongoose.isValidObjectId(contentId) || typeof viewerId !== 'string' || !viewerId.trim() || viewerId.length > 100) {
    return res.status(400).json({ message: 'Valid contentId and viewerId are required' });
  }
  const content = await Content.findOne({ _id: contentId, status: { $in: ['published', 'scheduled'] }, publishedAt: { $lte: new Date() } });
  if (!content) return res.status(404).json({ message: 'Content not found' });
  const existing = await Like.findOne({ contentId, viewerId });
  let liked;
  if (existing) {
    await existing.deleteOne();
    liked = false;
  } else {
    try { await Like.create({ contentId, viewerId }); liked = true; }
    catch (error) { if (error.code !== 11000) throw error; liked = true; }
  }
  const likeCount = await Like.countDocuments({ contentId });
  res.json({ liked, likeCount });
}));

module.exports = router;