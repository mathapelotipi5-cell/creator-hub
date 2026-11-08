require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function seedCreator() {
  const { CREATOR_EMAIL, CREATOR_PASSWORD } = process.env;
  if (!CREATOR_EMAIL || !CREATOR_PASSWORD || CREATOR_PASSWORD.length < 12) {
    throw new Error('Set CREATOR_EMAIL and a CREATOR_PASSWORD with at least 12 characters in server/.env');
  }
  await connectDB();
  const email = CREATOR_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) throw new Error(`A creator account already exists for ${email}`);
  await User.create({
    email,
    password: CREATOR_PASSWORD,
    name: process.env.CREATOR_NAME || 'MATHAPELO',
    siteName: process.env.SITE_NAME || 'MATHAPELO',
    tagline: process.env.CREATOR_TAGLINE || 'Film photography, made with intention.',
    intro: process.env.CREATOR_INTRO || 'An independent collection of film photographs, field notes, and practical guides to the craft behind each frame.',
    avatarUrl: process.env.CREATOR_AVATAR_URL || '',
  });
  console.log(`Creator account created for ${email}`);
  process.exit(0);
}

seedCreator().catch((error) => {
  console.error(error.message);
  process.exit(1);
});