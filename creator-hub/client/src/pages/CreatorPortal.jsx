import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creatorApi } from '../api.js';
import { CATEGORIES, formatDate } from '../utils.js';

const emptyForm = () => ({
  title: '',
  description: '',
  body: '',
  category: CATEGORIES[0],
  type: 'article',
  thumbnailUrl: '',
  mediaUrl: '',
  status: 'draft',
  featured: false,
  publishedAt: new Date().toISOString().slice(0, 16),
});

function localDateTime(value) {
  if (!value) return '';

  const date = new Date(value);

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16);
}

function getSavedToken() {
  try {
    return localStorage.getItem('creatorToken') || '';
  } catch {
    return '';
  }
}

function ContentEditor({ form, setForm, onSubmit, onCancel, saving }) {
  function change(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  return (
    <form className="creator-editor" onSubmit={onSubmit}>
      <h2>{form._id ? 'Edit content' : 'Add content'}</h2>

      <label>
        Title
        <input
          name="title"
          value={form.title}
          onChange={change}
          maxLength={180}
          required
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          maxLength={5000}
          rows={3}
          required
        />
      </label>

      <label>
        Article body
        <textarea
          name="body"
          value={form.body}
          onChange={change}
          maxLength={50000}
          rows={5}
        />
      </label>

      <div className="creator-fields">
        <label>
          Category
          <select
            name="category"
            value={form.category}
            onChange={change}
          >
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          Type
          <select
            name="type"
            value={form.type}
            onChange={change}
          >
            {['video', 'article', 'image', 'podcast'].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            name="status"
            value={form.status}
            onChange={change}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>

        <label>
          Publication date
          <input
            type="datetime-local"
            name="publishedAt"
            value={form.publishedAt || ''}
            onChange={change}
          />
        </label>
      </div>

      <label>
        Thumbnail URL
        <input
          type="url"
          name="thumbnailUrl"
          value={form.thumbnailUrl}
          onChange={change}
          maxLength={2000}
        />
      </label>

      <label>
        Media URL
        <input
          type="url"
          name="mediaUrl"
          value={form.mediaUrl}
          onChange={change}
          maxLength={2000}
        />
      </label>

      <label className="creator-check">
        <input
          type="checkbox"
          name="featured"
          checked={Boolean(form.featured)}
          onChange={change}
        />
        Featured on the home page
      </label>

      <div className="creator-actions">
        <button className="btn" disabled={saving}>
          {saving
            ? 'Saving…'
            : form._id
              ? 'Save changes'
              : 'Add content'}
        </button>

        {onCancel && (
          <button
            className="btn ghost"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Login({ onLogin, error, busy }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="creator-login-stage">

      <div className="creator-login-heading">
        <p className="creator-login-kicker">
          CREATOR ACCESS
        </p>

        <h1>
          Welcome to Your Creator Space<span>.</span>
        </h1>

        <p>
          Sign in to access your creator dashboard and manage your content.
        </p>
      </div>

      <aside className="creator-login-side creator-login-side-left">
        <h2 className="creator-login-manifesto">
          <span>Bring Your Creative</span>
          <span className="creator-login-manifesto-accent">Vision to Life.</span>
        </h2>

        <p className="creator-login-caption">
          <span className="creator-login-caption-lead">
            Turn your ideas into meaningful content and bring your stories to life.
          </span>
          <span className="creator-login-caption-detail">
            <span className="creator-login-copy-highlight">Create, organize and publish</span>
            {' '}your articles, videos, images and podcasts, connect with your audience,
            discover how people engage with your work and watch your creativity grow.
          </span>
          <span className="creator-login-caption-invitation">
            Login now to access your creative workspace!
          </span>
        </p>
      </aside>

      <form
        className="creator-login-form"
        onSubmit={(event) => {
          event.preventDefault();
          onLogin(email, password);
        }}
      >
        <h2 className="creator-login-form-title">
          CREATOR LOGIN
        </h2>

        <label>
          Email Address
          <input
            type="email"
            placeholder="Enter your email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && (
          <p className="state error" role="alert">
            {error}
          </p>
        )}

        <button className="btn" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

    </div>
  );
}

function CreatorPortal() {
  const navigate = useNavigate();

  const [token, setToken] = useState(getSavedToken);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [contents, setContents] = useState([]);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh(activeToken = token) {
    const [
      nextProfile,
      nextStats,
      nextContents,
      nextComments,
    ] = await Promise.all([
      creatorApi.profile(activeToken),
      creatorApi.stats(activeToken),
      creatorApi.contents(activeToken),
      creatorApi.comments(activeToken),
    ]);

    setProfile(nextProfile);
    setStats(nextStats);
    setContents(nextContents);
    setComments(nextComments);
  }

  useEffect(() => {
    if (!token) return;

    refresh(token).catch((err) => {
      setError(err.message);

      if (/session|login|required/i.test(err.message)) {
        localStorage.removeItem('creatorToken');
        setToken('');
      }
    });
  }, [token]);

  async function login(email, password) {
    setBusy(true);
    setError('');

    try {
      const result = await creatorApi.login({
        email,
        password,
      });

      localStorage.setItem('creatorToken', result.token);
      setToken(result.token);

      navigate('/creator/dashboard', {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem('creatorToken');

    setToken('');
    setProfile(null);
    setStats(null);
    setContents([]);
    setComments([]);

    navigate('/creator/login', {
      replace: true,
    });
  }

  async function saveContent(event) {
    event.preventDefault();

    setBusy(true);
    setError('');

    const { _id, ...values } = form;

    const payload = {
      ...values,
      publishedAt:
        values.status === 'draft' || !values.publishedAt
          ? null
          : new Date(values.publishedAt).toISOString(),
    };

    try {
      if (
        payload.status === 'scheduled' &&
        (
          !payload.publishedAt ||
          new Date(payload.publishedAt) <= new Date()
        )
      ) {
        throw new Error(
          'Scheduled content needs a future publication date.'
        );
      }

      if (_id) {
        await creatorApi.updateContent(_id, payload, token);
      } else {
        await creatorApi.createContent(payload, token);
      }

      setForm(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeContent(item) {
    if (
      !window.confirm(
        `Delete “${item.title}”? This also deletes its likes and comments.`
      )
    ) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await creatorApi.deleteContent(item._id, token);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function moderateComment(comment, status) {
    setBusy(true);
    setError('');

    try {
      if (status === 'deleted') {
        await creatorApi.deleteComment(comment._id, token);
      } else {
        await creatorApi.setCommentStatus(
          comment._id,
          status,
          token
        );
      }

      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <Login
        onLogin={login}
        error={error}
        busy={busy}
      />
    );
  }

  return (
    <div className="wrap block creator-dashboard">

      <div className="creator-heading">
        <div>
          <p className="meta">Creator dashboard</p>

          <h1 className="page-title">
            {profile?.siteName || 'Your content'}
          </h1>
        </div>

        <button className="btn creator-logout" type="button" onClick={logout}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M10 17l5-5-5-5M15 12H3m9-7h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6" />
          </svg>
          Log out
        </button>
      </div>

      {error && (
        <p className="state error" role="alert">
          {error}
        </p>
      )}

      {stats && (
        <section
          className="creator-stats"
          aria-label="Dashboard overview"
        >
          {[
            ['Content', stats.total],
            ['Published', stats.published],
            ['Drafts', stats.drafts],
            ['Scheduled', stats.scheduled],
            ['Comments', stats.comments],
            ['Pending', stats.pendingComments],
            ['Views', stats.views],
            ['Likes', stats.likes],
          ].map(([label, value]) => (
            <div className="creator-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
      )}

      <section className="creator-section">
        <div className="creator-section-heading">
          <h2>Content</h2>

          {!form && (
            <button
              className="btn"
              onClick={() => setForm(emptyForm())}
            >
              Add content
            </button>
          )}
        </div>

        {form && (
          <ContentEditor
            form={form}
            setForm={setForm}
            onSubmit={saveContent}
            onCancel={() => setForm(null)}
            saving={busy}
          />
        )}

        {contents.length === 0 ? (
          <p className="meta">
            No content yet. Add your first item above.
          </p>
        ) : (
          <div className="creator-table-wrap">
            <table className="creator-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Publication</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {contents.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.status}</td>

                    <td>
                      {item.publishedAt
                        ? formatDate(item.publishedAt)
                        : '—'}
                    </td>

                    <td className="creator-row-actions">
                      <button
                        className="btn ghost"
                        disabled={busy}
                        onClick={() =>
                          setForm({
                            ...item,
                            publishedAt: localDateTime(
                              item.publishedAt
                            ),
                          })
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn ghost"
                        disabled={busy}
                        onClick={() => removeContent(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="creator-section">
        <h2>Pending comments</h2>

        {comments.length === 0 ? (
          <p className="meta">
            Nothing needs moderation.
          </p>
        ) : (
          <ul className="creator-comments">
            {comments.map((comment) => (
              <li key={comment._id}>
                <div>
                  <strong>{comment.displayName}</strong>

                  <span className="meta">
                    {' '}on {comment.contentId?.title || 'content'}
                    {' '}· {formatDate(comment.createdAt)}
                  </span>

                  <p>{comment.text}</p>
                </div>

                <div className="creator-actions">
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      moderateComment(comment, 'approved')
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn ghost"
                    disabled={busy}
                    onClick={() =>
                      moderateComment(comment, 'hidden')
                    }
                  >
                    Hide
                  </button>

                  <button
                    className="btn ghost"
                    disabled={busy}
                    onClick={() =>
                      moderateComment(comment, 'deleted')
                    }
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}

export default CreatorPortal;