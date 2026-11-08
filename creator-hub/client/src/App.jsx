
import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { api } from './api.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Library from './pages/Library.jsx';
import ContentDetail from './pages/ContentDetail.jsx';
import CreatorPortal from './pages/CreatorPortal.jsx';
import { DEFAULT_PROFILE } from './utils.js';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Placeholder({ title }) {
  return (
    <div className="wrap block">
      <h1 className="page-title">{title}</h1>
      <p className="state">This page is built in the next step.</p>
      <Link className="btn ghost" to="/">Back to home</Link>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('creator-hub-theme') === 'dark';
  });

  useEffect(() => {
    document.title = `${DEFAULT_PROFILE.siteName} | ${DEFAULT_PROFILE.tagline}`;

    api.getProfile()
      .then((p) => {
        const nextProfile = { ...DEFAULT_PROFILE, ...p };
        setProfile(nextProfile);
        document.title = `${nextProfile.siteName} | ${nextProfile.tagline}`;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light'
    );

    localStorage.setItem(
      'creator-hub-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  function toggleTheme() {
    setDarkMode((currentMode) => !currentMode);
  }

  return (
    <>
      <ScrollToTop />

      <a className="skip" href="#main">
        Skip to content
      </a>

      <Header
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/library" element={<Library />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/creator/*" element={<CreatorPortal />} />
          <Route
            path="*"
            element={<Placeholder title="Page not found" />}
          />
        </Routes>
      </main>

      <Footer profile={profile} />
    </>
  );
}

export default App;
