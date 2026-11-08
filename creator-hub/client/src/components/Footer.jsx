import { DEFAULT_PROFILE } from '../utils.js';

function Footer({ profile }) {
  return (
    <footer className="site-footer">
      <div className="wrap foot">
        <p>
          Photography and field notes by {profile?.name || DEFAULT_PROFILE.name}.
        </p>
        <p>
          &copy; {new Date().getFullYear()} {profile?.siteName || DEFAULT_PROFILE.siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
export default Footer;
