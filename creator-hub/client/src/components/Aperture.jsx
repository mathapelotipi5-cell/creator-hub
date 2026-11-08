function Aperture({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="14" />
      <polygon points="16,9 22.06,12.5 22.06,19.5 16,23 9.94,19.5 9.94,12.5" />
      <path d="M16 9V2M22.06 12.5L28.12 9M22.06 19.5L28.12 23M16 23V30M9.94 19.5L3.88 23M9.94 12.5L3.88 9" />
    </svg>
  );
}
export default Aperture;
