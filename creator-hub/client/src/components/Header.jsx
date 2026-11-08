
import { Link, NavLink } from 'react-router-dom';
import Aperture from './Aperture.jsx';

function Header() {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link to="/" className="brand">
          <Aperture />

          <span className="brand-text">
            <span className="brand-name">MATHAPELO</span>
            <span className="brand-title">CONTENT CREATOR WEB</span>
          </span>
        </Link>

        <nav aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/creator/login">Creator Portal</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
