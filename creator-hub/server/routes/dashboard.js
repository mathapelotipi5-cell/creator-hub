const express = require('express');
const Content = require('../models/Content');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');
const requireCreator = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(requireCreator);

router.get('/stats', asyncHandler(async (req, res) => {
  const now = new Date();
  const [total, drafts, published, scheduled, comments, pendingComments, views, likes] = await Promise.all([
    Content.countDocuments(),
    Content.countDocuments({ status: 'draft' }),
    Content.countDocuments({ status: { $in: ['published', 'scheduled'] }, publishedAt: { $lte: now } }),
    Content.countDocuments({ status: { $in: ['published', 'scheduled'] }, publishedAt: { $gt: now } }),
    Comment.countDocuments(),
    Comment.countDocuments({ status: 'pending' }),
    Content.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Like.countDocuments(),
  ]);
  res.json({ total, drafts, published, scheduled, comments, pendingComments, views: views[0]?.total || 0, likes });
}));

router.get('/contents', asyncHandler(async (req, res) => {
  res.json(await Content.find().sort({ updatedAt: -1 }).limit(300));
}));

router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.creator.sub);
  if (!user) return res.status(404).json({ message: 'Creator profile not found' });
  res.json({ name: user.name, siteName: user.siteName, tagline: user.tagline, intro: user.intro, avatarUrl: user.avatarUrl });
}));

module.exports = router;