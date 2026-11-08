const express = require('express');
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const requireCreator = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const publishedFilter = () => ({ status: { $in: ['published', 'scheduled'] }, publishedAt: { $lte: new Date() } });
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function present(content) {
  const [likeCount, commentCount] = await Promise.all([
    Like.countDocuments({ contentId: content._id }),
    Comment.countDocuments({ contentId: content._id, status: 'approved' }),
  ]);
  return { ...content.toObject(), likeCount, commentCount };
}

router.get('/', asyncHandler(async (req, res) => {
  const filter = publishedFilter();
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.search) {
    const term = String(req.query.search).trim().slice(0, 100);
    if (term) {
      const safeTerm = escapeRegex(term);
      filter.$or = [{ title: { $regex: safeTerm, $options: 'i' } }, { description: { $regex: safeTerm, $options: 'i' } }, { category: { $regex: safeTerm, $options: 'i' } }];
    }
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
  const contents = await Content.find(filter).sort({ publishedAt: -1 }).limit(limit);
  res.json(await Promise.all(contents.map(present)));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid content ID' });
  const content = await Content.findOneAndUpdate({ _id: req.params.id, ...publishedFilter() }, { $inc: { views: 1 } }, { new: true });
  if (!content) return res.status(404).json({ message: 'Content not found' });
  res.json(await present(content));
}));

router.post('/', requireCreator, asyncHandler(async (req, res) => {
  const allowed = ['title', 'description', 'body', 'category', 'type', 'thumbnailUrl', 'mediaUrl', 'status', 'featured', 'publishedAt'];
  const payload = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const content = await Content.create(payload);
  res.status(201).json(content);
}));

router.put('/:id', requireCreator, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid content ID' });
  const allowed = ['title', 'description', 'body', 'category', 'type', 'thumbnailUrl', 'mediaUrl', 'status', 'featured', 'publishedAt'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const existing = await Content.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Content not found' });
  if ((update.status || existing.status) === 'published' && !update.publishedAt) update.publishedAt = existing.publishedAt || new Date();
  const nextStatus = update.status || existing.status;
  const nextPublishedAt = Object.hasOwn(update, 'publishedAt') ? new Date(update.publishedAt) : existing.publishedAt;
  if (nextStatus === 'scheduled' && (!nextPublishedAt || Number.isNaN(nextPublishedAt.valueOf()) || nextPublishedAt <= new Date())) {
    return res.status(400).json({ message: 'Scheduled content must have a future publication date' });
  }
  const content = await Content.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  res.json(content);
}));

router.delete('/:id', requireCreator, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid content ID' });
  const content = await Content.findByIdAndDelete(req.params.id);
  if (!content) return res.status(404).json({ message: 'Content not found' });
  await Promise.all([Comment.deleteMany({ contentId: content._id }), Like.deleteMany({ contentId: content._id })]);
  res.json({ message: 'Content deleted' });
}));

module.exports = { router, present };