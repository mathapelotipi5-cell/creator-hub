import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Frame from '../components/Frame.jsx';
import Aperture from '../components/Aperture.jsx';
import { DEFAULT_PROFILE } from '../utils.js';

function Home({ profile }) {
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([api.getContents({ featured: 'true', limit: 100 }), api.getContents({ limit: 100 })])
      .then(([f, l]) => {
        if (active) {
          const candidates = [...f, ...l].filter(
            (item, index, items) => items.findIndex((candidate) => candidate._id === item._id) === index
          );
          const selection = [];
          for (const type of ['article', 'video', 'podcast', 'image']) {
            const item = candidates.find((candidate) => candidate.type === type);
            if (item) selection.push(item);
            if (selection.length === 3) break;
          }
          for (const item of candidates) {
            if (selection.length >= 3) break;
            if (!selection.some((selected) => selected._id === item._id)) selection.push(item);
          }
          setFeatured(selection);
          setLatest(l);
        }
      })
      .catch(() => {
        if (active) {
          setFeatured([]);
          setLatest([]);
          setError('The journal is temporarily unavailable. Check back shortly.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  const creatorName = profile?.name || DEFAULT_PROFILE.name;
  const tagline = profile?.tagline || DEFAULT_PROFILE.tagline;
  const intro = profile?.intro || DEFAULT_PROFILE.intro;

  return (
    <>
      <section className="home-hero-band">
        <div className="hero wrap">
          <div className="hero-text">
            <p className="hero-kicker">Independent film journal <span /> 35mm &amp; medium format</p>
            <h1 className="hero-name">{creatorName}</h1>
            <p className="hero-tag">{tagline}</p>
            <p className="hero-intro">{intro}</p>
            <div className="hero-actions">
              <Link className="btn" to="/library">Explore the journal <span aria-hidden="true">&gt;</span></Link>
              <span className="hero-note">Stories, process, and the frames in between.</span>
            </div>
          </div>
          <figure className="hero-art">
            <div className="hero-contact-frame">
              <span className="contact-index">01</span>
              <div className="hero-mark">
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={`${creatorName} profile`} /> : <Aperture size={120} />}
              </div>
              <span className="contact-exposure">35 MM / ISO 400</span>
            </div>
            <figcaption className="hero-art-label"><span>MATHAPELO</span><span>FIELD NOTES / 2026</span></figcaption>
          </figure>
        </div>
      </section>

      {error && <div className="wrap home-error" role="alert"><p>{error}</p><button className="btn ghost" onClick={() => setReloadKey((key) => key + 1)}>Try again</button></div>}

      <section className="wrap block home-selection">
        <div className="block-head home-section-head">
          <div><p className="section-kicker">01 / Editor's selection</p><h2>Selected frames</h2></div>
          <p className="lede">A few stories worth sitting with.</p>
        </div>
        {loading && <p className="state" aria-live="polite">Developing the latest stories...</p>}
        {!loading && !error && featured?.length === 0 && <p className="state">No stories have been published yet. Check back soon.</p>}
        <div className="grid home-featured" aria-busy={loading}>
          {(featured || []).map((c, i) => <Frame key={c._id} item={c} number={i + 1} circled />)}
        </div>
      </section>

      <section className="home-archive-band">
        <div className="wrap block home-archive">
          <div className="block-head home-section-head">
            <div><p className="section-kicker">02 / Fresh from the archive</p><h2>Latest stories</h2></div>
            <Link className="text-link" to="/library">View all stories <span aria-hidden="true">&gt;</span></Link>
          </div>
          {!loading && !error && latest?.length === 0 && <p className="state">New stories are on the way.</p>}
          <div className="grid home-latest" aria-busy={loading}>
            {(latest || []).map((c, i) => <Frame key={c._id} item={c} number={i + 1} />)}
          </div>
        </div>
      </section>
    </>
  );
}
export default Home;
