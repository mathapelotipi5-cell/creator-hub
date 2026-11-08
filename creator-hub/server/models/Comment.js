const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  displayName: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
  text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);