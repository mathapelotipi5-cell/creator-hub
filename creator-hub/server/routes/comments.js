const express = require('express');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Content = require('../models/Content');
const requireCreator = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const live = (content) => content && ['published', 'scheduled'].includes(content.status) && content.publishedAt && content.publishedAt <= new Date();

router.get('/', requireCreator, asyncHandler(async (req, res) => {
  const status = ['pending', 'approved', 'hidden'].includes(req.query.status) ? req.query.status : 'pending';
  const comments = await Comment.find({ status }).populate('contentId', 'title').sort({ createdAt: -1 }).limit(200);
  res.json(comments);
}));

router.get('/:contentId', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.contentId)) return res.status(400).json({ message: 'Invalid content ID' });
  const comments = await Comment.find({ contentId: req.params.contentId, status: 'approved' }).sort({ createdAt: -1 }).limit(100);
  res.json(comments);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { contentId, displayName, text } = req.body;
  if (!mongoose.isValidObjectId(contentId)) return res.status(400).json({ message: 'Valid contentId is required' });
  if (typeof displayName !== 'string' || typeof text !== 'string') return res.status(400).json({ message: 'Display name and comment are required' });
  const content = await Content.findById(contentId);
  if (!live(content)) return res.status(404).json({ message: 'Content not found' });
  const comment = await Comment.create({ contentId, displayName, text });
  res.status(201).json({ message: 'Comment received', comment });
}));

router.patch('/:id', requireCreator, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid comment ID' });
  if (!['approved', 'hidden', 'pending'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid comment status' });
  const comment = await Comment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  res.json(comment);
}));

router.delete('/:id', requireCreator, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid comment ID' });
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  res.json({ message: 'Comment deleted' });
}));

module.exports = router;