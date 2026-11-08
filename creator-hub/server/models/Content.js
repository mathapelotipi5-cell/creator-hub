const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  body: { type: String, default: '', maxlength: 50000 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  type: { type: String, required: true, enum: ['video', 'article', 'image', 'podcast'] },
  thumbnailUrl: { type: String, default: '', trim: true, maxlength: 2000 },
  mediaUrl: { type: String, default: '', trim: true, maxlength: 2000 },
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
  featured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  views: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

contentSchema.pre('validate', function validatePublication() {
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  if (this.status === 'scheduled' && (!this.publishedAt || this.publishedAt <= new Date())) {
    this.invalidate('publishedAt', 'Scheduled content must have a future publication date');
  }
});

module.exports = mongoose.model('Content', contentSchema);