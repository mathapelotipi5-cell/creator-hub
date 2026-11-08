const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['creator'], default: 'creator' },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  siteName: { type: String, required: true, trim: true, maxlength: 100 },
  tagline: { type: String, default: '', trim: true, maxlength: 180 },
  intro: { type: String, default: '', trim: true, maxlength: 2000 },
  avatarUrl: { type: String, default: '', trim: true },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);