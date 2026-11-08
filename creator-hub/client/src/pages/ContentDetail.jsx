import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, getViewerId, isAudioFile, toEmbedUrl } from '../utils.js';
import Thumb from '../components/Thumb.jsx';
import CommentSection from '../components/CommentSection.jsx';

function Media({ item }) {
  const embed = item.type === 'video' ? toEmbedUrl(item.mediaUrl) : null;
  if (embed) {
    return <div className="embed"><iframe src={embed} title={item.title} allowFullScreen loading="lazy" /></div>;
  }
  if (item.type === 'image' && (item.mediaUrl || item.thumbnailUrl)) {
    return <img className="media-img" src={item.mediaUrl || item.thumbnailUrl} alt={item.title} />;
  }
  if (item.type === 'podcast' && isAudioFile(item.mediaUrl)) {
    return <audio className="audio" controls src={item.mediaUrl} />;
  }
  return (
    <div className="media-fallback">
      <Thumb src={item.thumbnailUrl} seed={item._id} alt={`Thumbnail for ${item.title}`} />
    </div>
  );
}

function ContentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareNote, setShareNote] = useState('');

  useEffect(() => {
    setItem(null);
    setError('');
    api.getContent(id)
      .then((c) => {
        setItem(c);
        setLikeCount(c.likeCount || 0);
        try { setLiked(localStorage.getItem(`liked:${id}`) === '1'); } catch { setLiked(false); }
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function like() {
    try {
      const res = await api.toggleLike({ contentId: id, viewerId: getViewerId() });
      setLiked(res.liked);
      setLikeCount(res.likeCount);
      try { localStorage.setItem(`liked:${id}`, res.liked ? '1' : '0'); } catch { /* ignore */ }
    } catch (e) {
      setShareNote(e.message);
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url }); return; } catch { /* cancelled, fall through */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied');
    } catch {
      setShareNote('Could not copy. Copy the address from your browser instead.');
    }
  }

  if (error) {
    return (
      <div className="wrap block">
        <p className="state error" role="alert">{error}</p>
        <Link className="btn ghost" to="/library">Back to the library</Link>
      </div>
    );
  }
  if (!item) return <div className="wrap block"><p className="state">Loading</p></div>;

  return (
    <article className="wrap block detail">
      <Link to="/library" className="back">Back to the library</Link>
      <h1 className="page-title">{item.title}</h1>
      <p className="meta">
        {item.category}, {item.type}, published {formatDate(item.publishedAt)}
      </p>

      <div className="frame detail-frame">
        <div className="holes" />
        <div className="detail-media"><Media item={item} /></div>
        <div className="frame-edge"><span>{item.views} views</span><span>{item.type}</span></div>
        <div className="holes" />
      </div>

      <div className="actions">
        <button className="btn ghost like" aria-pressed={liked} onClick={like}>
          {liked ? 'Liked' : 'Like'} ({likeCount})
        </button>
        <button className="btn ghost" onClick={share}>Share link</button>
        {item.mediaUrl && item.type !== 'image' && (
          <a className="btn" href={item.mediaUrl} target="_blank" rel="noopener noreferrer">
            {item.type === 'video' ? 'Watch' : item.type === 'podcast' ? 'Listen' : 'Open source'}
          </a>
        )}
        <span role="status" className="note">{shareNote}</span>
      </div>

      <div className="prose">
        <p className="description">{item.description}</p>
        {item.type === 'article' && item.body && item.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <CommentSection contentId={id} />
    </article>
  );
}
export default ContentDetail;
