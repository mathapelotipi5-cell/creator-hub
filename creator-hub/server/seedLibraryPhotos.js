require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Content = require('./models/Content');

const photos = [
  {
    title: 'Film Photography: Finding the Frame',
    description: 'A closer look at film cameras and the thoughtful process behind making a photograph.',
    category: 'Education',
    image: 'education-film.jpg',
  },
  {
    title: 'Behind the Lens: A Photographer\'s View',
    description: 'Explore the craft of photography through the tools and choices that shape each image.',
    category: 'Education',
    image: 'education-camera.jpg',
  },
  {
    title: 'Creative Technology in Photography',
    description: 'A visual look at how cameras and digital tools come together in a creative workspace.',
    category: 'Technology',
    image: 'technology-camera.jpg',
  },
  {
    title: 'Live Music, Shared Moments',
    description: 'The energy of a live performance captured from the crowd.',
    category: 'Entertainment',
    image: 'entertainment-music.jpg',
  },
  {
    title: 'The Concert Experience',
    description: 'Colour, sound and movement come together under the lights of a live show.',
    category: 'Entertainment',
    image: 'entertainment-concert.jpg',
  },
  {
    title: 'Evening Light Across the City',
    description: 'A quiet moment watching the city change as evening settles in.',
    category: 'Lifestyle',
    image: 'lifestyle-night.jpg',
  },
  {
    title: 'Open Landscapes and Green Horizons',
    description: 'A peaceful landscape that invites a slower look at the world around us.',
    category: 'Lifestyle',
    image: 'lifestyle-landscape.jpg',
  },
];

async function seedLibraryPhotos() {
  await connectDB();

  let created = 0;
  let unfeatured = 0;
  for (const photo of photos) {
    const imageUrl = `/images/library/${photo.image}`;
    const existing = await Content.findOne({ mediaUrl: imageUrl });
    if (existing) {
      if (existing.featured) {
        existing.featured = false;
        await existing.save();
        unfeatured += 1;
      }
      continue;
    }

    await Content.create({
      title: photo.title,
      description: photo.description,
      category: photo.category,
      type: 'image',
      thumbnailUrl: imageUrl,
      mediaUrl: imageUrl,
      status: 'published',
      featured: false,
      publishedAt: new Date(),
      views: 0,
    });
    created += 1;
  }

  console.log(`Published ${created} sample photo posts and removed featured status from ${unfeatured} sample photos.`);
  await mongoose.disconnect();
}

seedLibraryPhotos().catch(async (error) => {
  console.error('Could not publish sample photo posts:', error.message);
  if (mongoose.connection.readyState) await mongoose.disconnect();
  process.exitCode = 1;
});
