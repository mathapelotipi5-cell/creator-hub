import { Link } from 'react-router-dom';
import Thumb from './Thumb.jsx';
import { formatDate } from '../utils.js';


function Frame({ item, number, circled = false }) {
  return (
    <Link to={`/content/${item._id}`} className="frame-link">
      <div className="frame">
        <div className="holes" />
        <div className="frame-art">
          <Thumb
            src={item.thumbnailUrl}
            seed={item._id}
            category={item.category}
            alt={`Thumbnail for ${item.title}`}
          />
        </div>
        <div className="frame-edge">
          <span>{number}A</span>
          <span>{item.type}</span>
        </div>
        <div className="holes" />
        {circled && (
          <svg className="grease" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path pathLength="1" d="M11 55 C4 22 38 5 70 9 C97 13 99 50 88 76 C74 99 26 97 12 70 C8 62 10 55 17 49" />
          </svg>
        )}
      </div>
      <h3>{item.title}</h3>
      <p className="meta">
        {item.category}, {formatDate(item.publishedAt)}
      </p>
    </Link>
  );
}
export default Frame;
