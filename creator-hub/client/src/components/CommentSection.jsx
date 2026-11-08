import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatDate } from '../utils.js';

function CommentSection({ contentId }) {
  const [comments, setComments] = useState(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [note, setNote] = useState({ kind: '', msg: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getComments(contentId).then(setComments).catch(() => setComments([]));
  }, [contentId]);

  async function submit(e) {
    e.preventDefault();
    const displayName = name.trim();
    const body = text.trim();
    if (displayName.length < 2 || displayName.length > 40) return setNote({ kind: 'error', msg: 'Enter a display name between 2 and 40 characters.' });
    if (!body || body.length > 500) return setNote({ kind: 'error', msg: 'Write a comment of up to 500 characters.' });
    setSending(true);
    try {
      await api.addComment({ contentId, displayName, text: body });
      setText('');
      setNote({ kind: 'ok', msg: 'Comment sent. It will appear once the creator approves it.' });
    } catch (err) {
      setNote({ kind: 'error', msg: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-h">
      <h2 id="comments-h">Comments{comments ? ` (${comments.length})` : ''}</h2>

      <form onSubmit={submit} className="comment-form" noValidate>
        <label>
          Display name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="nickname" />
        </label>
        <label>
          Your comment
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500} />
        </label>
        <div className="form-row">
          <button className="btn" disabled={sending}>{sending ? 'Sending' : 'Post comment'}</button>
          <span role="status" className={`note ${note.kind}`}>{note.msg}</span>
        </div>
      </form>

      {comments === null && <p className="meta">Loading comments</p>}
      {comments && comments.length === 0 && <p className="meta">No comments yet. Be the first to write one.</p>}
      <ul className="comment-list">
        {(comments || []).map((c) => (
          <li key={c._id}>
            <p className="who"><strong>{c.displayName}</strong> <span className="meta">{formatDate(c.createdAt)}</span></p>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
export default CommentSection;
