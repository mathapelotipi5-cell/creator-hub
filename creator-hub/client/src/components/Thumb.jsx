import { useState } from 'react';

// Uses the creator's thumbnail when there is one, otherwise draws a quiet tonal "photograph"
function hash(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const sampleThumbnails = {
  Education: [
    '/images/library/education-film.jpg',
    '/images/library/education-camera.jpg',
  ],
  Technology: [
    '/images/library/education-camera.jpg',
    '/images/library/technology-camera.jpg',
  ],
  Entertainment: [
    '/images/library/entertainment-music.jpg',
    '/images/library/entertainment-concert.jpg',
  ],
  Lifestyle: [
    '/images/library/lifestyle-night.jpg',
    '/images/library/lifestyle-landscape.jpg',
  ],
};

function Thumb({ src, seed, category, alt = '' }) {
  const [imageAttempt, setImageAttempt] = useState(() => (src ? 0 : 1));
  const h = hash(seed);
  const categoryImages = sampleThumbnails[category] || sampleThumbnails.Lifestyle;
  const sampleImage = categoryImages[h % categoryImages.length];
  const imageSrc = imageAttempt === 0 && src ? src : imageAttempt < 2 ? sampleImage : '';

  if (imageSrc) {
    return (
      <img
        className="thumb"
        src={imageSrc}
        alt={alt}
        loading="lazy"
        onError={() => setImageAttempt((attempt) => Math.min(attempt + 1, 2))}
      />
    );
  }

  const hue = [205, 28, 150, 352, 45, 262][h % 6];
  const horizon = 42 + (h % 22);
  const sun = 18 + ((h >> 3) % 84);
  const gid = 'g' + String(seed).replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg className="thumb" viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt || 'Placeholder photograph'}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 28% 80%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 34% 42%)`} />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill={`url(#${gid})`} />
      <circle cx={sun} cy={horizon - 17} r="9" fill={`hsl(${hue} 55% 93%)`} opacity="0.85" />
      <path d={`M0 ${horizon} Q30 ${horizon - 12} 60 ${horizon - 2} T120 ${horizon - 6} V80 H0Z`} fill={`hsl(${hue} 30% 19%)`} />
    </svg>
  );
}
export default Thumb;
