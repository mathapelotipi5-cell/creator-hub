import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES } from '../utils.js';
import Frame from '../components/Frame.jsx';

function Library() {
  const [params, setParams] = useSearchParams();

  const q = params.get('q') || '';
  const category = params.get('category') || '';

  const [text, setText] = useState(q);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  function setParam(key, value) {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setParams(next, { replace: true });
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (text.trim() !== q) {
        setParam('q', text.trim());
      }
    }, 300);

    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    setItems(null);
    setError('');

    api.getContents({ search: q, category })
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [q, category]);

  function clearAll() {
    setText('');
    setParams({}, { replace: true });
  }

  return (
    <div className="wrap block">

      <h1 className="page-title">The library</h1>

      <div className="tools">
        <label className="search">
          <span className="sr-only">Search content</span>

          <input
            type="search"
            placeholder="Search titles and keywords"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>

        <div
          className="chips"
          role="group"
          aria-label="Filter by category"
        >
          <button
            aria-pressed={!category}
            onClick={() => setParam('category', '')}
          >
            All
          </button>

          {CATEGORIES.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setParam('category', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="meta count" role="status">
        {items
          ? `${items.length} ${items.length === 1 ? 'frame' : 'frames'}`
          : 'Loading'}
      </p>

      {error && (
        <p className="state error" role="alert">
          {error}
        </p>
      )}

      {items && items.length === 0 && (
        <div className="state">
          <p>
            Nothing matches
            {q ? ` “${q}”` : ''}
            {category ? ` in ${category}` : ''}.
          </p>

          <button
            className="btn ghost"
            onClick={clearAll}
          >
            Clear search and filters
          </button>
        </div>
      )}

      <div className="grid">
        {(items || []).map((c, i) => (
          <Frame
            key={c._id}
            item={c}
            number={i + 1}
            circled={c.featured}
          />
        ))}
      </div>

    </div>
  );
}

export default Library;