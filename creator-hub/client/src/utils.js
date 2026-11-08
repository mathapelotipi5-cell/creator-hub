export const CATEGORIES = ['Education', 'Technology', 'Entertainment', 'Lifestyle'];
export const DEFAULT_PROFILE = {
  name: 'MATHAPELO',
  siteName: 'MATHAPELO',
  tagline: 'Film photography, made with intention.',
  intro: 'An independent collection of film photographs, field notes, and practical guides to the craft behind each frame.',
  avatarUrl: '',
};

export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

// Anonymous viewer id so likes can be limited to one per browser
export function getViewerId() {
  try {
    let id = localStorage.getItem('viewerId');
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('viewerId', id);
    }
    return id;
  } catch {
    return 'v_anonymous';
  }
}

export function toEmbedUrl(url = '') {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) return url;
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean).pop()}`;
  } catch {
    /* not a valid URL */
  }
  return null;
}

export const isAudioFile = (url = '') => /\.(mp3|m4a|ogg|wav)(\?|$)/i.test(url);
