const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

const profile = {
  name: 'MATHAPELO',
  siteName: 'MATHAPELO',
  tagline: 'Film photography, made with intention.',
  intro:
    'An independent collection of film photographs, field notes, and practical guides to the craft behind each frame.',
  avatarUrl: '',
};

const contents = [
  { _id: 'c1', title: 'Developing Tri-X in a kitchen sink', category: 'Education', type: 'video', featured: true, status: 'published', publishedAt: '2026-10-28T09:00:00Z', views: 1840, likes: 212,
    description: 'A full walkthrough of home development: chemistry temperatures, agitation rhythm and how to dry negatives without dust. No darkroom needed, just a changing bag and patience.',
    mediaUrl: 'https://example.com/watch/tri-x-sink', thumbnailUrl: '' },
  { _id: 'c2', title: 'Why I still carry a light meter', category: 'Technology', type: 'article', featured: false, status: 'published', publishedAt: '2026-10-21T09:00:00Z', views: 960, likes: 88,
    description: 'Camera meters are fine until the light gets strange. Here is how a handheld meter saved a roll of Portra.',
    body: 'Most cameras made after 1980 have a meter built in, and most of the time it is right.\n\nThe trouble starts with backlit faces, snow and stage lighting. A handheld meter lets you read the light falling on the subject instead of the light bouncing off everything behind it.\n\nI carry a small one in my coat pocket. It weighs less than a roll of film and has rescued more frames than any lens I own.',
    mediaUrl: '', thumbnailUrl: '' },
  { _id: 'c3', title: 'Market morning on Ektar 100', category: 'Lifestyle', type: 'image', featured: false, status: 'published', publishedAt: '2026-10-14T09:00:00Z', views: 540, likes: 131,
    description: 'Saturated reds, early light and a vendor who asked me to wait while she fixed her scarf. Shot at f/5.6 on a 50mm.',
    mediaUrl: '', thumbnailUrl: '' },
  { _id: 'c4', title: 'Three frames I almost threw away', category: 'Entertainment', type: 'podcast', featured: true, status: 'published', publishedAt: '2026-10-09T09:00:00Z', views: 720, likes: 97,
    description: 'An episode about blurred, underexposed and badly framed photographs that turned out to be my favourites.',
    mediaUrl: 'https://example.com/podcast/three-frames', thumbnailUrl: '' },
  { _id: 'c5', title: 'Reading a contact sheet: what to circle first', category: 'Education', type: 'article', featured: true, status: 'published', publishedAt: '2026-10-02T09:00:00Z', views: 1210, likes: 176,
    description: 'A simple routine for going through 36 frames without second-guessing every one.',
    body: 'Start with a loupe and a red grease pencil.\n\nFirst pass: circle anything that makes you stop, even if it is soft or crooked. Do not judge yet.\n\nSecond pass: look at the circled frames next to their neighbours. The best frame is often the one just before or just after the one you picked.\n\nThird pass: put the sheet away for a week, then look again.',
    mediaUrl: '', thumbnailUrl: '' },
  { _id: 'c6', title: 'Scanning 35mm with a phone and a lightbox', category: 'Technology', type: 'video', featured: false, status: 'published', publishedAt: '2026-09-25T09:00:00Z', views: 2300, likes: 304,
    description: 'The cheapest way to digitise negatives that still looks good. Includes how to invert colour negatives properly.',
    mediaUrl: 'https://example.com/watch/phone-scan', thumbnailUrl: '' },
  { _id: 'c7', title: 'A year with one camera and one lens', category: 'Lifestyle', type: 'article', featured: false, status: 'published', publishedAt: '2026-09-14T09:00:00Z', views: 880, likes: 119,
    description: 'What changed when I stopped switching gear and started paying attention to where I stood.',
    body: 'In January I put every other camera on a shelf.\n\nThe first month was frustrating. By March I stopped thinking about focal length and started noticing doorways, windows and the way people wait.\n\nIf you feel stuck, limit yourself. It is the quickest way I know to see differently.',
    mediaUrl: '', thumbnailUrl: '' },
  { _id: 'c8', title: 'Photo walk: golden hour on expired Portra', category: 'Entertainment', type: 'video', featured: false, status: 'published', publishedAt: '2026-09-03T09:00:00Z', views: 640, likes: 74,
    description: 'Come along on a slow evening walk with a roll that expired in 2019. Results at the end.',
    mediaUrl: 'https://example.com/watch/photo-walk', thumbnailUrl: '' },
  { _id: 'c9', title: 'Pushing HP5 to 3200', category: 'Education', type: 'article', featured: false, status: 'draft', publishedAt: null, views: 0, likes: 0, description: 'Draft, not visible to viewers.', body: '', mediaUrl: '', thumbnailUrl: '' },
  { _id: 'c10', title: 'Cross-processing slide film', category: 'Education', type: 'video', featured: false, status: 'scheduled', publishedAt: '2026-12-20T09:00:00Z', views: 0, likes: 0, description: 'Scheduled, appears on the publication date.', mediaUrl: '', thumbnailUrl: '' },
];

const seedComments = [
  { _id: 'm1', contentId: 'c1', displayName: 'Palesa', text: 'Tried this last weekend and my negatives came out clean. Thank you!', status: 'approved', createdAt: '2026-10-29T10:00:00Z' },
  { _id: 'm2', contentId: 'c1', displayName: 'Tumelo', text: 'What did you use to dry them?', status: 'approved', createdAt: '2026-10-30T08:30:00Z' },
  { _id: 'm3', contentId: 'c5', displayName: 'Naledi', text: 'The second-pass idea is great. I always miss the frame next to my pick.', status: 'approved', createdAt: '2026-10-05T17:20:00Z' },
];

const isLive = (c) => c.status !== 'draft' && c.publishedAt && new Date(c.publishedAt) <= new Date();
const getComments = () => read('slowlight:mock-comments', seedComments);
const getLikes = () => read('slowlight:mock-likes', {});
const views = () => read('slowlight:mock-views', {});

function present(c) {
  const likes = getLikes();
  const extra = Object.keys(likes).filter((k) => k.endsWith(':' + c._id) && likes[k]).length;
  return {
    ...c,
    views: c.views + (views()[c._id] || 0),
    likeCount: c.likes + extra,
    commentCount: getComments().filter((m) => m.contentId === c._id && m.status === 'approved').length,
    createdAt: c.publishedAt,
  };
}

export const mockApi = {
  async getProfile() {
    await delay(100);
    return profile;
  },
  async getContents({ search = '', category = '', featured = '', limit = 0 } = {}) {
    await delay();
    const q = search.trim().toLowerCase();
    let list = contents.filter(isLive);
    if (category) list = list.filter((c) => c.category === category);
    if (featured === 'true') list = list.filter((c) => c.featured);
    if (q) list = list.filter((c) => [c.title, c.description, c.category].join(' ').toLowerCase().includes(q));
    list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (limit) list = list.slice(0, Number(limit));
    return list.map(present);
  },
  async getContent(id) {
    await delay();
    const c = contents.find((x) => x._id === id && isLive(x));
    if (!c) throw new Error('This content was not found. It may have been removed or not published yet.');
    const v = views();
    v[id] = (v[id] || 0) + 1;
    write('slowlight:mock-views', v);
    return present(c);
  },
  async getComments(contentId) {
    await delay(150);
    return getComments()
      .filter((m) => m.contentId === contentId && m.status === 'approved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  async addComment({ contentId, displayName, text }) {
    await delay();
    const all = getComments();
    const comment = { _id: 'm' + Date.now(), contentId, displayName, text, status: 'pending', createdAt: new Date().toISOString() };
    write('slowlight:mock-comments', [...all, comment]);
    return { message: 'Comment received', comment };
  },
  async toggleLike({ contentId, viewerId }) {
    await delay(120);
    const likes = getLikes();
    const key = `${viewerId}:${contentId}`;
    likes[key] = !likes[key];
    write('slowlight:mock-likes', likes);
    const c = contents.find((x) => x._id === contentId);
    return { liked: likes[key], likeCount: present(c).likeCount };
  },
};
